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
  Switch,
} from "antd";
import produce from "immer";
import NFootball from "../NFootball";
import UFootball from "../UFootball";
import SFootball from "../SFootball";
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
    openVictory: false,
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
        <Form.Item
          label="主队名"
          rules={[
            {
              required: true,
            },
          ]}
          name="homeTeam"
        >
          <Mentions ref={firstInputRef} style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item
          label="客队名"
          rules={[
            {
              required: true,
            },
          ]}
          name="visitingTeam"
        >
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
        <Form.Item
          label="允许单买胜平负"
          name="openVictory"
          valuePropName="checked"
        >
          <Switch></Switch>
        </Form.Item>
        <Row gutter={2}>
          <Col span={4}>
            <Form.Item
              label="胜"
              rules={[
                {
                  required: true,
                },
              ]}
              name={["oddsInfos", "singleVictory", "win"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="平"
              rules={[
                {
                  required: true,
                },
              ]}
              name={["oddsInfos", "singleVictory", "draw"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label="负"
              rules={[
                {
                  required: true,
                },
              ]}
              name={["oddsInfos", "singleVictory", "lose"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={2}>
          <Col span={4}>
            <Form.Item
              label={state.handicapWinLabel}
              rules={[
                {
                  required: true,
                },
              ]}
              name={["oddsInfos", "handicapVictory", "win"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label={state.handicapDrawLabel}
              rules={[
                {
                  required: true,
                },
              ]}
              name={["oddsInfos", "handicapVictory", "draw"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              label={state.handicapLoseLabel}
              rules={[
                {
                  required: true,
                },
              ]}
              name={["oddsInfos", "handicapVictory", "lose"]}
            >
              <InputNumber></InputNumber>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={2}>
          {UFootball.scoreWinOddList.map((item, i) => (
            <Col span={4} key={i}>
              <Form.Item
                rules={[
                  {
                    required: true,
                  },
                ]}
                label={
                  item.isOther
                    ? item.otherDesc
                    : item.home + ":" + item.visiting
                }
                name={["oddsInfos", "score", "winList", i, "odd"]}
              >
                <InputNumber></InputNumber>
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row gutter={2}>
          {UFootball.scoreDrawOddList.map((item, i) => (
            <Col span={4} key={i}>
              <Form.Item
                rules={[
                  {
                    required: true,
                  },
                ]}
                label={
                  item.isOther
                    ? item.otherDesc
                    : item.home + ":" + item.visiting
                }
                name={["oddsInfos", "score", "drawList", i, "odd"]}
              >
                <InputNumber></InputNumber>
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row gutter={2}>
          {UFootball.scoreLoseOddList.map((item, i) => (
            <Col span={4} key={i}>
              <Form.Item
                rules={[
                  {
                    required: true,
                  },
                ]}
                label={
                  item.isOther
                    ? item.otherDesc
                    : item.home + ":" + item.visiting
                }
                name={["oddsInfos", "score", "loseList", i, "odd"]}
              >
                <InputNumber></InputNumber>
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row gutter={2}>
          {UFootball.goalOddList.map((item, i) => (
            <Col span={4} key={i}>
              <Form.Item
                rules={[
                  {
                    required: true,
                  },
                ]}
                label={item.desc}
                name={["oddsInfos", "goalList", i, "odd"]}
              >
                <InputNumber></InputNumber>
              </Form.Item>
            </Col>
          ))}
        </Row>
        <Row gutter={2}>
          {UFootball.halfVictoryOddList.map((item, i) => (
            <Col span={4} key={i}>
              <Form.Item
                rules={[
                  {
                    required: true,
                  },
                ]}
                label={item.home + "/" + item.visiting}
                name={["oddsInfos", "halfVictoryList", i, "odd"]}
              >
                <InputNumber></InputNumber>
              </Form.Item>
            </Col>
          ))}
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
    form.validateFields().then(async (values: NFootball.ITeamOdds) => {
      values.oddsInfos.score.winList = UFootball.scoreWinOddList.map(
        (item, i) => {
          return {
            ...item,
            odd: values.oddsInfos.score.winList[i].odd,
          };
        }
      );
      values.oddsInfos.score.drawList = UFootball.scoreDrawOddList.map(
        (item, i) => {
          return {
            ...item,
            odd: values.oddsInfos.score.drawList[i].odd,
          };
        }
      );
      values.oddsInfos.score.loseList = UFootball.scoreLoseOddList.map(
        (item, i) => {
          return {
            ...item,
            odd: values.oddsInfos.score.loseList[i].odd,
          };
        }
      );
      values.oddsInfos.goalList = UFootball.goalOddList.map((item, i) => {
        return {
          ...item,
          odd: values.oddsInfos.goalList[i].odd,
        };
      });
      values.oddsInfos.halfVictoryList = UFootball.halfVictoryOddList.map(
        (item, i) => {
          return {
            ...item,
            odd: values.oddsInfos.halfVictoryList[i].odd,
          };
        }
      );
      const rsp = await SFootball.saveTeamOdds(tempDataRef.current.id, values);
      if (rsp.success) {
        onCancel();
        props.onOk();
      }
    });
  }
};
export default forwardRef(FootballOddsModal);
