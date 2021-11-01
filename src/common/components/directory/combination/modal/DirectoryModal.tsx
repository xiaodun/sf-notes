import React, {
  useState,
  useImperativeHandle,
  ForwardRefRenderFunction,
  forwardRef,
} from "react";
import { Modal } from "antd";
import { produce } from "@/common";
import PageDirectory from "../../PageDirectory";
import { NSystem } from "@/common/namespace/NSystem";
export interface IDirectoryModalProps {
  onOk: (pathInfos: NSystem.IDirectory) => void;
}
export interface IDirectoryModalState {
  visible: boolean;
  pathInfos: NSystem.IDirectory;
}

const defaultState: IDirectoryModalState = {
  visible: false,
  pathInfos: null,
};
export interface IDirectoryModal {
  showModal: () => void;
}
export const EditModal: ForwardRefRenderFunction<
  IDirectoryModal,
  IDirectoryModalProps
> = (props, ref) => {
  const [state, setState] = useState<Partial<IDirectoryModalState>>(
    defaultState
  );
  useImperativeHandle(ref, () => ({
    showModal: () => {
      const newState = produce(state, (drafState) => {
        drafState.visible = true;
      });
      setState(newState);
    },
  }));
  return (
    <Modal
      title="选择目录"
      visible={state.visible}
      onOk={() => onOk()}
      centered
      maskClosable={false}
      onCancel={onClose}
      width={1000}
    >
      {state.visible && <PageDirectory onSelect={onSelect}></PageDirectory>}
    </Modal>
  );
  async function onOk() {
    props.onOk(state.pathInfos);
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
