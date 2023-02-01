import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Mentions,
  Radio,
  InputNumber,
  Row,
  Col,
  Switch,
} from "antd";
import produce from "immer";
import NFootball from "../NFootball";
import UFootball from "../UFootball";
import SFootball from "../SFootball";
export interface ICrawlingmModal {
  showModal: (id: string) => void;
}
export interface ICrawlingmModalProps {
  onOk: () => void;
}

export interface ITempData {
  id: string;
}
export interface ICrawlingmModalState {
  visible: boolean;
  loading: boolean;
  gameList: Array<NFootball.IGameInfo>;
}
const getDefaultTempData = (): ITempData => ({
  id: null,
});
const defaultState: ICrawlingmModalState = {
  visible: false,
  loading: false,
  gameList: [],
};
const CrawlingmModal: ForwardRefRenderFunction<
  ICrawlingmModal,
  ICrawlingmModalProps
> = (props, ref) => {
  const [state, setState] = useState<ICrawlingmModalState>(defaultState);
  const tempDataRef = useRef<ITempData>(getDefaultTempData());
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => ({
    showModal: (id: string) => {
      tempDataRef.current.id = id;
      let newState = { ...state, visible: true };
      setState(newState);
      reqAllowGuessGame(newState);
    },
  }));

  return (
    <Modal
      width="800px"
      title="选择比赛"
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
    ></Modal>
  );

  async function reqAllowGuessGame(newState: ICrawlingmModalState) {
    const rsp = await SFootball.getAllowGuessGame();
    setState(
      produce(newState, (drafState) => {
        drafState.gameList = rsp.list;
      })
    );
  }

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values) => {
      setState(
        produce(state, (drafState) => {
          drafState.loading = true;
        })
      );

      //   if (rsp.success) {
      //     onCancel();
      //     props.onOk();
      //   }
    });
  }
};
export default forwardRef(CrawlingmModal);
