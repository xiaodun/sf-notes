import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Form, Input } from "antd";
import { produce } from "immer";
import moment from "moment";
import NLottery from "../NLottery";
import NModel from "@/common/namespace/NModel";
import { MDLottery } from "../models/MDLottery";
import SLottery from "../SLottery";
import NRouter from "@/../config/router/NRouter";

export interface IAddLotteryModal {
  showModal: (isEdit: boolean, record?: NLottery) => void;
}

export interface IAddLotteryModalProps {
  onOk: () => void;
}

export interface IAddLotteryModalState {
  open: boolean;
  isEdit: boolean;
  title: string;
  record?: NLottery;
}

const defaultState: IAddLotteryModalState = {
  open: false,
  isEdit: false,
  title: "创建预测",
};

const AddLotteryModal: ForwardRefRenderFunction<
  IAddLotteryModal,
  IAddLotteryModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddLotteryModalState>(defaultState);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    showModal: (isEdit: boolean = false, record?: NLottery) => {
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
          new MDLottery.AREditLottery({
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
        // 直接调用 API 添加，获取返回的新创建数据
        SLottery.addLottery({
          name: values.name,
        }).then((rsp) => {
          if (rsp.success && rsp.data) {
            setState(
              produce(state, (drafState) => {
                drafState.open = false;
              })
            );
            // 添加成功后直接跳转到投注页面
            window.umiHistory.push(
              `${NRouter.lotteryPredictPath}?id=${rsp.data.id}`
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

export default forwardRef(AddLotteryModal);
