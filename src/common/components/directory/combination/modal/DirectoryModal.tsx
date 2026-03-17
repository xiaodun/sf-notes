import React, {
  useState,
  useImperativeHandle,
  ForwardRefRenderFunction,
  forwardRef,
} from 'react';
import { Breadcrumb, message, Modal } from 'antd';
import { produce } from 'immer';
import PageDirectory from '../../PageDirectory';
import { NSystem } from '@/common/namespace/NSystem';
import { TFilter } from '../../PageDirectory';
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
}
export const EditModal: ForwardRefRenderFunction<
  IDirectoryModal,
  IDirectoryModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<Partial<IDirectoryModalState>>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: (data) => {
      const startPath = normalizeStartPath(data?.startPath);
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        drafState.directoryKey = Math.random();
        drafState.showParasm = {
          ...(data || ({} as any)),
          startPath,
        };
        drafState.pathInfos = createPathInfo(startPath);
      });
      setState(newState);
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
      {breadcrumbItems.length > 0 && (
        <Breadcrumb>
          {breadcrumbItems.map((item, index) => (
            <Breadcrumb.Item key={index}>{item.title}</Breadcrumb.Item>
          ))}
        </Breadcrumb>
      )}
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
