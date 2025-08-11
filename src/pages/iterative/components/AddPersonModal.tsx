import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { NMDIterative } from 'umi';
import { Modal, Button, Form, Input, message, Select } from 'antd';
import { produce } from 'immer';
import NIterative from '../NIterative';
import SIterative from '../SIterative';
export interface IAddPersonModal {
  showModal: () => void;
}
export interface IAddPersonModalProps {
  MDIterative: NMDIterative.IState;
  onOk: () => void;
}

export interface IAddPersonModalState {
  open: boolean;
}
const defaultState: IAddPersonModalState = {
  open: false,
};
const AddPersonModal: ForwardRefRenderFunction<
  IAddPersonModal,
  IAddPersonModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<IAddPersonModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();
  const { MDIterative } = props;
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.open = true;
        }),
      );
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="添加人员"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
      open={state.open}
      footer={
        <Button type="primary" onClick={onOk}>
          确定
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Form
        form={form}
        name="basic"
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="姓名"
          rules={[{ required: true }]}
        >
          <Input ref={firstInputRef} onPressEnter={onOk}></Input>
        </Form.Item>
        <Form.Item
          name="roleId"
          label="角色"
          rules={[{ required: true }]}
        >
          <Select>
            {MDIterative.roleList.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.roleName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机号"
          rules={[{ required: true }]}
        >
          <Input onPressEnter={onOk}></Input>
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values: NIterative.IPerson) => {
      const rsp = await SIterative.addPerson(values);
      if (rsp.success) {
        onCancel();
        props.onOk();
      } else if (!rsp.isHaveReadMsg) {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(AddPersonModal);
