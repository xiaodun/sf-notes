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
  message,
  Mentions,
  Radio,
  InputNumber,
  Row,
  Col,
} from "antd";
import produce from "immer";
import NFootball from "../NFootball";
export interface IFootballOddsModal {
  showModal: (id: number) => void;
}
export interface IFootballOddsModalProps {
  onOk: () => void;
}

export interface ITempData {
  id: number;
  defaultFormData: Partial<NFootball.ITeamOdds>;
}
export interface IFootballOddsModalState {
  visible: boolean;
  handicapWinLabel: string;
  handicapDrawLabel: string;
  handicapLoseLabel: string;
}
const defaultTempData: ITempData = {
  id: null,
  defaultFormData: {
    isLet: true,
    handicapCount: 1,
  },
};
const defaultState: IFootballOddsModalState = {
  visible: false,
  handicapWinLabel: null,
  handicapLoseLabel: null,
  handicapDrawLabel: null,
};
const FootballOddsModal: ForwardRefRenderFunction<
  IFootballOddsModal,
  IFootballOddsModalProps
> = (props, ref) => {
  const [state, setState] = useState<IFootballOddsModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Mentions>();
  const tempDataRef = useRef<ITempData>(defaultTempData);
  useImperativeHandle(ref, () => ({
    showModal: (id: number) => {
      tempDataRef.current.id = id;
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          const infos = getHandicapLabel();
          Object.keys(infos).forEach((key) => {
            drafState[key] = infos[key];
          });
        })
      );
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="800px"
      title="赔率信息"
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
      <Form
        form={form}
        name="basic"
        layout="vertical"
        autoComplete="off"
        initialValues={tempDataRef.current.defaultFormData}
      >
        <Form.Item label="主队名" name="homeTeam">
          <Mentions ref={firstInputRef} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="客队名" name="visitingTeam">
          <Mentions style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="是否为让" name="isLet">
          <Radio.Group onChange={onHandicapLabelChange}>
            <Radio.Button value={true}>是</Radio.Button>
            <Radio.Button value={false}>否</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="让球数" name="handicapCount">
          <Radio.Group onChange={onHandicapLabelChange}>
            <Radio.Button value={1}>1</Radio.Button>
            <Radio.Button value={2}>2</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Row gutter={2}>
          <Col span={4}>
            <Form.Item label="胜" name={["oddsInfos", "singleVictory", "win"]}>
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="平" name={["oddsInfos", "singleVictory", "draw"]}>
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item label="负" name={["oddsInfos", "singleVictory", "lose"]}>
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={2}>
          <Col span={4}>
            <Form.Item
              label={state.handicapWinLabel}
              name={["oddsInfos", "handicapVictory", "win"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label={state.handicapDrawLabel}
              name={["oddsInfos", "handicapVictory", "draw"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label={state.handicapLoseLabel}
              name={["oddsInfos", "handicapVictory", "lose"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
  function onHandicapLabelChange() {
    setState(
      produce(state, (drafState) => {
        const infos = getHandicapLabel();
        Object.keys(infos).forEach((key) => {
          drafState[key] = infos[key];
        });
      })
    );
  }
  function getHandicapLabel() {
    let isLet = form.getFieldValue("isLet");
    let handicapCount =
      form.getFieldValue("handicapCount") ||
      tempDataRef.current.defaultFormData.handicapCount;
    let prefix = (isLet ? "让" : "受让") + handicapCount + "球";
    return {
      handicapWinLabel: prefix + "胜",
      handicapDrawLabel: prefix + "平",
      handicapLoseLabel: prefix + "负",
    };
  }
  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values) => {
      console.log("wx", values);
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
export default forwardRef(FootballOddsModal);
