import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message } from "antd";
import produce from "immer";
import SIterative from "../SIterative";
import NIterative from "../NIterative";
export interface IAddRoleModal {
  showModal: () => void;
}
export interface IAddRoleModalProps {}
export interface IAddRoleModalState {
  visible: boolean;
}
const defaultState: IAddRoleModalState = {
  visible: false,
};
const AddRoleModal: ForwardRefRenderFunction<
  IAddRoleModal,
  IAddRoleModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddRoleModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        })
      );
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="添加角色"
      maskClosable={false}
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
      <Form form={form} name="basic" layout="vertical" autoComplete="off">
        <Form.Item
          label={"角色名"}
          name="roleName"
          rules={[{ required: true }]}
        >
          <Input ref={firstInputRef}></Input>
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values: NIterative.IRole) => {
      const rsp = await SIterative.addRole(values);
      if (rsp.success) {
        onCancel();
        SIterative.getRoleList();
      } else if (!rsp.isHaveReadMsg) {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(AddRoleModal);
