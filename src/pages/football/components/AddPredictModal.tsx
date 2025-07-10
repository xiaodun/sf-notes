import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, DatePicker, InputNumber } from "antd";
import { produce } from "immer";
import NFootball from "../NFootball";
import SFootball from "../SFootball";
import moment from "moment";

export interface IAddPredictModal {
  showModal: (isEdit: boolean, id?: string) => void;
}
export interface IAddPredictModalProps {
  onOk: () => void;
}
import UFootball from "../UFootball";
export interface IAddPredictModalState {
  visible: boolean;
  isEdit: boolean;
  title: string;
  id?: string;
}
const defaultState: IAddPredictModalState = {
  visible: false,
  isEdit: false,
  title: "创建一场预测",
};
const AddPredictModal: ForwardRefRenderFunction<
  IAddPredictModal,
  IAddPredictModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddPredictModalState>(defaultState);
  const [form] = Form.useForm();
  const urlInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: (isEdit: boolean = false, id?: string) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.isEdit = isEdit;
          if (isEdit) {
            drafState.title = "修改基础信息";
            drafState.id = id;
            SFootball.getPredictInfoById(id).then((rsp) => {
              form.setFieldsValue({
                name: rsp.data.name,
                money: rsp.data.money,
              });
            });
          } else {
            form.setFieldsValue({
              name: moment().format(UFootball.dateFormatStr),
              money: 0,
            });
          }
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
      title={state.title}
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
        <Form.Item label="名字" name="name" rules={[{ required: true }]}>
          <Input ref={urlInputRef} onPressEnter={onOk} />
        </Form.Item>
        <Form.Item label="金额" name="money" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} onPressEnter={onOk} />
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }
  function onOk() {
    form.validateFields().then(async (values: NFootball) => {
      let params = { ...values };
      if (state.isEdit) {
        params.id = state.id;
        params.isEdit = state.isEdit;
      }
      await SFootball.createPredict(params);
      props.onOk();
      onCancel();
    });
  }
};
export default forwardRef(AddPredictModal);
