import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message, Select } from "antd";
import produce from "immer";
import NIterative from "../NIterative";
import SIterative from "../SIterative";
export interface IAddRoleModal {
  showModal: (roleTagList: NIterative.ITag[]) => void;
}
export interface IAddRoleModalProps {
  onOk: () => void;
}

export interface IAddRoleModalState {
  visible: boolean;
  roleTagList: NIterative.ITag[];
}
const defaultState: IAddRoleModalState = {
  visible: false,
  roleTagList: [],
};
const AddRoleModal: ForwardRefRenderFunction<
  IAddRoleModal,
  IAddRoleModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddRoleModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: (roleTagList: NIterative.ITag[]) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.roleTagList = roleTagList;
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
        <Form.Item name="name" label="姓名" rules={[{ required: true }]}>
          <Input ref={firstInputRef} onPressEnter={onOk}></Input>
        </Form.Item>
        <Form.Item name="role" label="角色" rules={[{ required: true }]}>
          <Select>
            {state.roleTagList.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
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
        props.onOk();
      } else {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(AddRoleModal);
