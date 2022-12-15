import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Radio,
  Select,
  Checkbox,
  message,
} from "antd";
import produce from "immer";
import SBase from "@/common/service/SBase";
import urlParse from "url-parse";
import USwagger from "@/common/utils/USwagger";
import NSwagger from "@/common/namespace/NSwagger";
import SelfStyle from "./AddPredictModal.less";
import NFootball from "../../NFootball";
import SFootball from "../../SFootball";
import { NMDFootball } from "umi";
import moment from "moment";

export interface IAddPredictModal {
  showModal: () => void;
}
export interface IAddPredictModalProps {
  onOk: () => void;
}

export interface IAddPredictModalState {
  visible: boolean;
}
const defaultState: IAddPredictModalState = {
  visible: false,
};
const AddPredictModal: ForwardRefRenderFunction<
  IAddPredictModal,
  IAddPredictModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddPredictModalState>(defaultState);
  const [form] = Form.useForm();
  const urlInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          form.setFieldsValue({
            date: moment().format("yyyy-MM-DD"),
          });
          setTimeout(() => {
            if (urlInputRef.current) {
              urlInputRef.current.focus();
            }
          }, 100);
        })
      );
    },
  }));

  return (
    <Modal
      width="500px"
      title="创建一场预测"
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
        <Form.Item label="名字" name="date" rules={[{ required: true }]}>
          <Input ref={urlInputRef} onPressEnter={onOk} />
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }
  function onOk() {
    form.validateFields().then(async (values) => {});
  }
};
export default forwardRef(AddPredictModal);
