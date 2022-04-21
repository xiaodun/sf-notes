import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message, Radio } from "antd";
import produce from "immer";
import NIterative from "../NIterative";
import SIterative from "../SIterative";
export interface IAddSystemModal {
  showModal: () => void;
}
export interface IAddSystemModalProps {}

export interface IAddSystemModalState {
  visible: boolean;
}
const defaultState: IAddSystemModalState = {
  visible: false,
};
const AddSystemModal: ForwardRefRenderFunction<
  IAddSystemModal,
  IAddSystemModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddSystemModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        })
      );
      form.setFieldsValue({
        isMoreEnv: false,
        isAddHead: false,
      });
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="添加系统"
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
          label="系统名"
          name={"systemName"}
          rules={[{ required: true }]}
        >
          <Input ref={firstInputRef}></Input>
        </Form.Item>
        <Form.Item label="访问地址" name={"url"}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="是否有多个环境" name={"isMoreEnv"}>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="在头部添加" name={"isAddHead"}>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values: NIterative.ISystem) => {
      const rsp = await SIterative.addSystem(values);
      if (rsp.success) {
        onCancel();
        SIterative.getSystemList();
      } else {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(AddSystemModal);
