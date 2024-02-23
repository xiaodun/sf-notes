import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message, Switch } from "antd";
import { produce } from "immer";
export interface IMockConfigModal {
  showModal: () => void;
}
export interface IMockConfigModalProps {
  onOk: () => void;
}

export interface IMockConfigModalState {
  visible: boolean;
}
const defaultState: IMockConfigModalState = {
  visible: false,
};
const MockConfigModal: ForwardRefRenderFunction<
  IMockConfigModal,
  IMockConfigModalProps
> = (props, ref) => {
  const [state, setState] = useState<IMockConfigModalState>(defaultState);
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
      title="修改配置"
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
          label="项目地址"
          name="programUrl"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="http://localhost:8000"></Input>
        </Form.Item>
        <Form.Item
          label="路径前缀"
          name="programPrefix"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="/"></Input>
        </Form.Item>
        <Form.Item
          label="请求前缀"
          name="apiPrefixList"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder="/"></Input>
        </Form.Item>
        <Form.Item
          label="代理增加前缀"
          name="autoAddPrefix"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Switch></Switch>
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values) => {
      // const rsp = await SProject.createSnippetGroup({
      //   ...values,
      //   id: state.project.id,
      //   isGroup: true,
      // });
      // if (rsp.success) {
      //   onCancel();
      //   props.onOk();
      // } else {
      //   message.error(rsp.message);
      // }
    });
  }
};
export default forwardRef(MockConfigModal);
