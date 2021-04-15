import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Input, Form } from "antd";
import SelfStyle from "./CreateBookModal";
import { FormInstance } from "antd/lib/form";

import produce from "immer";
export interface ICreateBookModalRef {
  showModal: () => void;
}
export interface ICreateBookModal {
  onOk: (bookName: string) => void;
}
export interface ICreateBookModalState {
  visible: boolean;
}
const defaultState: ICreateBookModalState = {
  visible: false,
};
const CreateBookModal: ForwardRefRenderFunction<
  ICreateBookModalRef,
  ICreateBookModal
> = (props, ref) => {
  const [state, setState] = useState<ICreateBookModalState>(defaultState);
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
      setTimeout(() => {
        document.getElementById("bookNameInput").focus();
      });
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
      props.onOk(rest[0].bookName);
      onCancel();
    });
  }
  return (
    <Modal
      width="400px"
      title="创建书籍"
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
      <Form ref={formRef} {...layout}>
        <Form.Item
          label="书籍名称"
          name="bookName"
          rules={[{ required: true, message: "请输入书籍名称" }]}
        >
          <Input id="bookNameInput" autoFocus />
        </Form.Item>
      </Form>
    </Modal>
  );
};
export default forwardRef(CreateBookModal);
