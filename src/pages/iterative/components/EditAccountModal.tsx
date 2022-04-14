import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message, Radio, Select } from "antd";
import produce from "immer";
import NIterative from "../NIterative";
import NProject from "@/pages/project/NProject";
import SIterative from "../SIterative";
import { NMDIterative } from "umi";

export interface IEditAccountModal {
  showModal: (roles: NIterative.IRole) => void;
}
export interface IEditAccountModalProps {
  MDIterative: NMDIterative.IState;

  onOk: () => void;
}

export interface IEditAccountModalState {
  visible: boolean;

  roles: NIterative.IRole;
}
const defaultState: IEditAccountModalState = {
  visible: false,

  roles: null,
};
const EditAccountModal: ForwardRefRenderFunction<
  IEditAccountModal,
  IEditAccountModalProps
> = (props, ref) => {
  const [state, setState] = useState<IEditAccountModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();
  const { MDIterative } = props;
  useImperativeHandle(ref, () => ({
    showModal: (roles: NIterative.IRole) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.roles = roles;
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
      title="编辑账号"
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
        <Form.Item label="系统" name="system" rules={[{ required: true }]}>
          <Select
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            optionFilterProp="children"
          >
            {MDIterative.systemTagList.map((item) => (
              <Select.Option key={item.value} value={item.value}>
                {item.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="账号" name={"account"} rules={[{ required: true }]}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="密码" name={"password"} rules={[{ required: true }]}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="环境" name="env">
          <Select
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            optionFilterProp="children"
          >
            {MDIterative.envTagList.map((item) => (
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
    form.validateFields().then(async (values: NIterative.IAccount) => {
      const rsp = await SIterative.addAccount(state.roles.id, values);
      if (rsp.success) {
        onCancel();
        props.onOk();
      } else {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(EditAccountModal);
