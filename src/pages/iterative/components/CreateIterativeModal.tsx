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
  showModal: (iteratives?: NIterative) => void;
}
export interface ICreateIterativeModalModalProps {
  onOk: () => void;
}

export interface ICreateIterativeModalModalState {
  visible: boolean;
  iterative: NIterative;
}
const defaultState: ICreateIterativeModalModalState = {
  visible: false,
  iterative: null,
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
    showModal: (iteratives?: NIterative) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.iterative = iteratives;
          form.setFieldsValue(iteratives);
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
      title={state.iterative ? "修改迭代" : "创建迭代"}
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
            onChange={(e) =>
              state.iterative ? onContentChange(e.target.value) : () => {}
            }
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
        <Form.Item label="分享人" name={"sharePerson"}>
          <Input></Input>
        </Form.Item>
        <Form.Item label="接口文档" name={"ajaxUrl"}>
          <Input></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
  function onContentChange(value: string) {
    const docUrlPattern = new RegExp(`(https?://lanhuapp.com/url/\\w+)`);
    const namePattern = new RegExp(
      `相关项目: ([-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]*)`
    );
    const docPasswordPattern = new RegExp(`密码: (\\w*)`);
    const sharePersonPattern = new RegExp(
      `分享人: ([-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]*)`
    );
    if (value) {
      form.setFieldsValue({
        docUrl: docUrlPattern.exec(value)?.[1],
        name: namePattern.exec(value)?.[1],
        sharePerson: sharePersonPattern.exec(value)?.[1],
        docPassword: docPasswordPattern.exec(value)?.[1],
      });
    }
  }
  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values: NIterative) => {
      const rsp = state.iterative
        ? await SIterative.saveIteraitve({ ...state.iterative, ...values })
        : await SIterative.createIterative({
            ...{ content: "", ajaxUrl: "", name: "" },
            ...values,
          });
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
