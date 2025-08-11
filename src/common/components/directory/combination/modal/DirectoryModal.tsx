import React, {
  useState,
  useImperativeHandle,
  ForwardRefRenderFunction,
  forwardRef,
} from "react";
import { message, Modal } from "antd";
import { produce } from "immer";
import PageDirectory from "../../PageDirectory";
import { NSystem } from "@/common/namespace/NSystem";
import { TFilter } from "../../PageDirectory";
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
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        drafState.directoryKey = Math.random();
        drafState.showParasm = data || ({} as any);
      });
      setState(newState);
    },
  }));
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
      {state.visible && (
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
      message.error("请选择一个路径!");
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
};

export default forwardRef(EditModal);
