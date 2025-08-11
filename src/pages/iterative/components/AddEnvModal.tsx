import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Modal, Button, Form, Input, message } from 'antd';
import { produce } from 'immer';
import SIterative from '../SIterative';
import NIterative from '../NIterative';
export interface IAddEnvModal {
  showModal: () => void;
}
export interface IAddEnvModalProps {}

export interface IAddEnvModalState {
  open: boolean;
}
const defaultState: IAddEnvModalState = {
  open: false,
};
const AddEnvModal: ForwardRefRenderFunction<
  IAddEnvModal,
  IAddEnvModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddEnvModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();

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
      title="添加环境"
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
        <Form.Item label="环境名" name={'envName'}>
          <Input ref={firstInputRef}></Input>
        </Form.Item>
        <Form.Item label="分支名" name={'branch'}>
          <Input></Input>
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values: NIterative.IEnv) => {
      const rsp = await SIterative.addEnv(values);
      if (rsp.success) {
        onCancel();
        SIterative.getEnvList();
        SIterative.getSystemList();
      } else if (!rsp.isHaveReadMsg) {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(AddEnvModal);
