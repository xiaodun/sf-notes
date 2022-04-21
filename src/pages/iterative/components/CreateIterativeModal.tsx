import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message } from "antd";
import produce from "immer";
import NIterative from "../NIterative";
import SIterative from "../SIterative";
export interface ICreateIterativeModalModal {
  showModal: () => void;
}
export interface ICreateIterativeModalModalProps {
  onOk: () => void;
}

export interface ICreateIterativeModalModalState {
  visible: boolean;
}
const defaultState: ICreateIterativeModalModalState = {
  visible: false,
};
const CreateIterativeModalModal: ForwardRefRenderFunction<
  ICreateIterativeModalModal,
  ICreateIterativeModalModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<ICreateIterativeModalModalState>(defaultState);
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
      title="创建迭代"
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
        <Form.Item label="文本信息" name="content">
          <Input.TextArea
            rows={6}
            ref={firstInputRef}
            onPressEnter={onOk}
            onChange={(e) => onContentChange(e.target.value)}
            placeholder="黏贴蓝湖信息文本,将自动解析"
          ></Input.TextArea>
        </Form.Item>
        <Form.Item label="迭代名" name={"name"}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="文档链接" name={"docUrl"}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="文档密码" name={"docPassword"}>
          <Input></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
  function onContentChange(value: string) {
    const pattern = RegExp(
      `(https?://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5])[\\w\\W]*?相关项目: ([-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]*)[\\w\\W]*?密码: (\\w*)`,
      "g"
    );

    if (value) {
      const result = pattern.exec(value);
      if (result) {
        form.setFieldsValue({
          docUrl: result[1],
          name: result[2],
          docPassword: result[3],
        });
      }
    }
  }
  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values) => {
      const { content, ...restParams } = values;
      const data = restParams as NIterative;
      const rsp = await SIterative.createIterative(data);
      if (rsp.success) {
        onCancel();
        props.onOk();
      } else {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(CreateIterativeModalModal);
