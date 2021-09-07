import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Input, Form } from "antd";
import SelfStyle from "./AddProjectModal";
import { FormInstance } from "antd/lib/form";

import produce from "immer";
export interface IAddProjectModalRef {
  showModal: () => void;
}
export interface IAddProjectModal {}
export interface IAddProjectModalState {
  visible: boolean;
}
const defaultState: IAddProjectModalState = {
  visible: false,
};
const AddProjectModal: ForwardRefRenderFunction<
  IAddProjectModalRef,
  IAddProjectModal
> = (props, ref) => {
  const [state, setState] = useState<IAddProjectModalState>(defaultState);
  const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  };
  const formRef = React.createRef<FormInstance>();
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        })
      );
    },
  }));
  function onCancel() {
    formRef.current.resetFields();
    setState(
      produce(state, (drafState) => {
        Object.keys(defaultState).forEach(
          (key) => (drafState[key] = defaultState[key])
        );
      })
    );
  }

  function onOk() {
    formRef.current.validateFields().then((...rest) => {
      onCancel();
    });
  }
  return (
    <Modal
      width="400px"
      title="添加项目"
      bodyStyle={{ maxHeight: "100%" }}
      visible={state.visible}
      footer={
        <Button type="primary" onClick={onOk}>
          确定
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Form ref={formRef} {...layout}></Form>
    </Modal>
  );
};
export default forwardRef(AddProjectModal);
