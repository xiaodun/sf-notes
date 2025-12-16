import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Form, Input } from "antd";
import { produce } from "immer";
import moment from "moment";
import NSevenStar from "../NSevenStar";
import NModel from "@/common/namespace/NModel";
import { MDSevenStar } from "../models/MDSevenStar";
import SSevenStar from "../SSevenStar";
import NRouter from "@/../config/router/NRouter";

export interface IAddSevenStarModal {
  showModal: (isEdit: boolean, record?: NSevenStar) => void;
}

export interface IAddSevenStarModalProps {
  onOk: () => void;
}

export interface IAddSevenStarModalState {
  open: boolean;
  isEdit: boolean;
  title: string;
  record?: NSevenStar;
}

const defaultState: IAddSevenStarModalState = {
  open: false,
  isEdit: false,
  title: "创建预测",
};

const AddSevenStarModal: ForwardRefRenderFunction<
  IAddSevenStarModal,
  IAddSevenStarModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddSevenStarModalState>(defaultState);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    showModal: (isEdit: boolean = false, record?: NSevenStar) => {
      setState(
        produce(state, (drafState) => {
          drafState.open = true;
          drafState.isEdit = isEdit;
          drafState.record = record;
          if (isEdit) {
            drafState.title = "修改预测";
            form.setFieldsValue({
              name: record?.name || "",
            });
          } else {
            drafState.title = "创建预测";
            form.setFieldsValue({
              name: moment().format("YYYY-MM-DD"),
            });
          }
        })
      );
    },
  }));

  return (
    <Modal
      width="500px"
      title={state.title}
      maskClosable={false}
      open={state.open}
      footer={
        <Button type="primary" onClick={onOk}>
          确定
        </Button>
      }
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          label="预测名称"
          name="name"
          rules={[{ required: true, message: "请输入预测名称" }]}
        >
          <Input placeholder="请输入预测名称" />
        </Form.Item>
      </Form>
    </Modal>
  );

  function onOk() {
    form.validateFields().then((values) => {
      if (state.isEdit && state.record) {
        NModel.dispatch(
          new MDSevenStar.AREditSevenStar({
            ...state.record,
            name: values.name,
            updateTime: new Date().toISOString(),
          })
        );
        setState(
          produce(state, (drafState) => {
            drafState.open = false;
          })
        );
        props.onOk();
      } else {
        SSevenStar.addSevenStar({
          name: values.name,
        }).then((rsp) => {
          if (rsp.success && rsp.data) {
            setState(
              produce(state, (drafState) => {
                drafState.open = false;
              })
            );
            window.umiHistory.push(
              `${NRouter.sevenStarPredictPath}?id=${rsp.data.id}`
            );
          }
        });
      }
    });
  }

  function onCancel() {
    setState(
      produce(state, (drafState) => {
        drafState.open = false;
      })
    );
  }
};

export default forwardRef(AddSevenStarModal);


