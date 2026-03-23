import React, {
  useState,
  useImperativeHandle,
  ForwardRefRenderFunction,
  forwardRef,
} from 'react';
import { Breadcrumb, Button, message, Modal } from 'antd';
import { produce } from 'immer';
import PageDirectory from '../../PageDirectory';
import { NSystem } from '@/common/namespace/NSystem';
import { TFilter } from '../../PageDirectory';
import SSystem from '@/common/service/SSystem';
import {
  DIRECTORY_MODAL_MEMORY_STORAGE_KEY,
  TDirectoryMemoryKey,
} from '../../constants/directoryMemory';
export interface IDirectoryModalProps {
  onOk: (pathInfos: NSystem.IDirectory, selectCallbackFlag?: string) => void;
}
export interface IDirectoryModalState {
  open: boolean;
  pathInfos: NSystem.IDirectory;
  showParasm: IDirectoryModalShowParams;
  directoryKey: number;
}

const defaultState: IDirectoryModalState = {
  open: false,
  pathInfos: null,
  directoryKey: Math.random(),
  showParasm: {} as any,
};
export interface IDirectoryModal {
  showModal: (data: IDirectoryModalShowParams) => void;
}
export interface IDirectoryModalShowParams {
  startPath?: string;
  disableFile?: boolean;
  selectCallbackFlag?: string;
  filter?: TFilter;
  memoryKey?: TDirectoryMemoryKey;
  defaultStartPath?: string;
}
export const EditModal: ForwardRefRenderFunction<
  IDirectoryModal,
  IDirectoryModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<Partial<IDirectoryModalState>>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: async (data) => {
      const defaultStartPath = await resolveValidStartPath(normalizeStartPath(data?.startPath));
      const rememberedStartPath = await getRememberedStartPath(data?.memoryKey, defaultStartPath);
      const startPath = rememberedStartPath || defaultStartPath;
      setState((prevState) =>
        produce(prevState, (drafState) => {
          drafState.open = true;
          drafState.directoryKey = Math.random();
          drafState.showParasm = {
            ...(data || ({} as any)),
            startPath,
            defaultStartPath,
          };
          drafState.pathInfos = createPathInfo(startPath);
        })
      );
    },
  }));
  const breadcrumbItems = getBreadcrumbItems(state.pathInfos?.path);
  return (
    <Modal
      title="选择目录"
      open={state.open}
      onOk={() => onOk()}
      centered
      maskClosable={false}
      onCancel={onClose}
      width={1000}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <Button onClick={onReset}>重置</Button>
        {breadcrumbItems.length > 0 && (
          <Breadcrumb>
            {breadcrumbItems.map((item, index) => (
              <Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}
      </div>
      {state.open && (
        <PageDirectory
          key={state.directoryKey}
          startPath={state.showParasm.startPath}
          filter={state.showParasm.filter}
          disableFile={state.showParasm.disableFile}
          onSelect={onSelect}
        ></PageDirectory>
      )}
    </Modal>
  );
  async function onOk() {
    if (!state.pathInfos) {
      message.error('请选择一个路径!');
      return;
    }
    saveRememberPath(state.showParasm.memoryKey, state.pathInfos.path);
    props.onOk(state.pathInfos, state.showParasm.selectCallbackFlag);
    onClose();
  }
  function onSelect(pathInfos: NSystem.IDirectory) {
    const newState = produce(state, (drafState) => {
      drafState.pathInfos = pathInfos;
    });
    setState(newState);
  }
  function onClose() {
    setState({ ...defaultState });
  }
  async function onReset() {
    removeRememberPath(state.showParasm.memoryKey);
    const startPath = await resolveValidStartPath(
      normalizeStartPath(state.showParasm.defaultStartPath)
    );
    setState((prevState) =>
      produce(prevState, (drafState) => {
        drafState.directoryKey = Math.random();
        drafState.showParasm = {
          ...(drafState.showParasm || ({} as any)),
          startPath,
        };
        drafState.pathInfos = createPathInfo(startPath);
      })
    );
  }
  function createPathInfo(startPath?: string) {
    if (!startPath) {
      return null;
    }
    const normalizePath = startPath.replace(/\//g, "\\");
    const pathParts = normalizePath.split("\\").filter(Boolean);
    const name = pathParts[pathParts.length - 1] || normalizePath;
    return {
      name,
      path: normalizePath,
      stuffix: "",
      isLeaf: false,
      isDisk: /^[A-Za-z]:\\?$/.test(normalizePath),
    } as NSystem.IDirectory;
  }
  function normalizeStartPath(startPath?: string) {
    const value = String(startPath || "").trim();
    if (!value) {
      return "";
    }
    const normalized = value.replace(/\//g, "\\");
    const driveOnly = normalized.match(/^([A-Za-z]:)\\?$/);
    if (driveOnly) {
      return `${driveOnly[1]}\\`;
    }
    if (/^[A-Za-z]:[^\\]/.test(normalized)) {
      return `${normalized.slice(0, 2)}\\`;
    }
    return normalized;
  }
  async function resolveValidStartPath(startPath?: string) {
    const normalized = normalizeStartPath(startPath);
    if (!normalized) {
      return '';
    }
    const isValid = await checkDirectoryPathValid(normalized);
    return isValid ? normalized : '';
  }
  async function getRememberedStartPath(memoryKey?: TDirectoryMemoryKey, defaultStartPath?: string) {
    if (!memoryKey) {
      return defaultStartPath || '';
    }
    const memoryMap = readMemoryMap();
    const rememberPath = normalizeStartPath(memoryMap[memoryKey]);
    if (!rememberPath) {
      return defaultStartPath || '';
    }
    const isValid = await checkDirectoryPathValid(rememberPath);
    if (isValid) {
      return rememberPath;
    }
    removeRememberPath(memoryKey);
    return defaultStartPath || '';
  }
  async function checkDirectoryPathValid(targetPath?: string) {
    const normalized = normalizeStartPath(targetPath);
    if (!normalized) {
      return false;
    }
    const rsp = await SSystem.getFileDirectory(normalized);
    if (!rsp.success) {
      return false;
    }
    const messageText = String(rsp.message || '');
    if (messageText.includes('路径不存在')) {
      return false;
    }
    return true;
  }
  function saveRememberPath(memoryKey?: TDirectoryMemoryKey, directoryPath?: string) {
    if (!memoryKey || !directoryPath) {
      return;
    }
    const memoryMap = readMemoryMap();
    memoryMap[memoryKey] = directoryPath;
    writeMemoryMap(memoryMap);
  }
  function removeRememberPath(memoryKey?: TDirectoryMemoryKey) {
    if (!memoryKey) {
      return;
    }
    const memoryMap = readMemoryMap();
    delete memoryMap[memoryKey];
    writeMemoryMap(memoryMap);
  }
  function readMemoryMap() {
    try {
      const memoryText = localStorage.getItem(DIRECTORY_MODAL_MEMORY_STORAGE_KEY);
      const memoryData = JSON.parse(memoryText || '{}');
      if (memoryData && typeof memoryData === 'object') {
        return memoryData as Record<string, string>;
      }
      return {} as Record<string, string>;
    } catch (error) {
      return {} as Record<string, string>;
    }
  }
  function writeMemoryMap(memoryMap: Record<string, string>) {
    localStorage.setItem(
      DIRECTORY_MODAL_MEMORY_STORAGE_KEY,
      JSON.stringify(memoryMap || {})
    );
  }
  function getBreadcrumbItems(path?: string) {
    if (!path) {
      return [];
    }
    const normalizePath = path.replace(/\//g, "\\");
    const isDiskRoot = /^[A-Za-z]:\\?$/.test(normalizePath);
    if (isDiskRoot) {
      return [{ title: normalizePath.replace(/\\$/, "") }];
    }
    const match = normalizePath.match(/^([A-Za-z]:)\\?(.*)$/);
    if (!match) {
      return [{ title: normalizePath }];
    }
    const drive = match[1];
    const rest = match[2];
    const parts = rest.split("\\").filter(Boolean);
    return [{ title: drive }, ...parts.map((item) => ({ title: item }))];
  }
};

export default forwardRef(EditModal);
