import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
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
} from 'antd';
import { produce } from 'immer';
import NFootball from '../NFootball';
import UFootball from '../UFootball';
import SFootball from '../SFootball';
import moment from 'moment';
export interface IFootballOddsModal {
  showModal: (
    id: string,
    teamOdds: NFootball.ITeamRecordOdds,
  ) => void;
}
export interface IFootballOddsModalProps {
  onOk: () => void;
}

export interface ITempData {
  id: string;
  defaultFormData: Partial<NFootball.ITeamRecordOdds>;
}
export interface IFootballOddsModalState {
  open: boolean;
  loading: boolean;
  handicapWinLabel: string;
  handicapDrawLabel: string;
  handicapLoseLabel: string;
}
const getDefaultTempData = (): ITempData => ({
  id: null,
  defaultFormData: {
    handicapCount: 1,
    openVictory: false,
  },
});
const defaultState: IFootballOddsModalState = {
  open: false,
  handicapWinLabel: null,
  handicapLoseLabel: null,
  handicapDrawLabel: null,
  loading: false,
};
const FootballOddsModal: ForwardRefRenderFunction<
  IFootballOddsModal,
  IFootballOddsModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<IFootballOddsModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef();
  const tempDataRef = useRef<ITempData>(getDefaultTempData());
  useImperativeHandle(ref, () => ({
    showModal: (id: string, teamOdds: NFootball.ITeamRecordOdds) => {
      tempDataRef.current.id = id;

      setState(
        produce(state, (drafState) => {
          drafState.open = true;
          const infos = getHandicapLabel();
          Object.keys(infos).forEach((key) => {
            drafState[key] = infos[key];
          });
          if (teamOdds) {
            form.setFieldsValue(teamOdds);
            tempDataRef.current.defaultFormData = teamOdds;
          } else {
            form.setFieldsValue(tempDataRef.current.defaultFormData);
          }
        }),
      );
      setTimeout(() => {
        // @ts-ignore
        firstInputRef.current?.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="800px"
      title="赔率信息"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
      open={state.open}
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
          <Mentions ref={firstInputRef} style={{ width: '100%' }} />
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
          <Mentions style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item
          label="编码"
          rules={[
            {
              required: true,
            },
          ]}
          name="code"
        >
          <Input style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="让球数" name="handicapCount">
          <Radio.Group onChange={onHandicapLabelChange}>
            <Radio.Button value={1}>+1</Radio.Button>
            <Radio.Button value={2}>+2</Radio.Button>
            <Radio.Button value={-1}>-1</Radio.Button>
            <Radio.Button value={-2}>-2</Radio.Button>
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
              name={['oddsInfos', 'singleVictory', 'win']}
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
              name={['oddsInfos', 'singleVictory', 'draw']}
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
              name={['oddsInfos', 'singleVictory', 'lose']}
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
              name={['oddsInfos', 'handicapVictory', 'win']}
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
              name={['oddsInfos', 'handicapVictory', 'draw']}
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
              name={['oddsInfos', 'handicapVictory', 'lose']}
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
                    : item.home + ':' + item.visiting
                }
                name={['oddsInfos', 'score', 'winList', i, 'odd']}
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
                    : item.home + ':' + item.visiting
                }
                name={['oddsInfos', 'score', 'drawList', i, 'odd']}
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
                    : item.home + ':' + item.visiting
                }
                name={['oddsInfos', 'score', 'loseList', i, 'odd']}
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
                name={['oddsInfos', 'goalList', i, 'odd']}
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
                label={item.home + '/' + item.visiting}
                name={['oddsInfos', 'halfVictoryList', i, 'odd']}
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
      }),
    );
  }
  function getHandicapLabel() {
    let handicapCount =
      form.getFieldValue('handicapCount') ||
      tempDataRef.current.defaultFormData.handicapCount;
    let prefix =
      (handicapCount < 0 ? '让' : '受让') +
      Math.abs(handicapCount) +
      '球';
    return {
      handicapWinLabel: prefix + '胜',
      handicapDrawLabel: prefix + '平',
      handicapLoseLabel: prefix + '负',
    };
  }
  function onCancel() {
    tempDataRef.current.defaultFormData =
      getDefaultTempData().defaultFormData;
    tempDataRef.current.id = null;
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form
      .validateFields()
      .then(async (values: NFootball.ITeamRecordOdds) => {
        setState(
          produce(state, (drafState) => {
            drafState.loading = true;
          }),
        );
        values.id = tempDataRef.current.defaultFormData.id;
        values.oddsInfos.score.winList =
          UFootball.scoreWinOddList.map((item, i) => {
            return {
              ...item,
              odd: values.oddsInfos.score.winList[i].odd,
            };
          });
        values.oddsInfos.score.drawList =
          UFootball.scoreDrawOddList.map((item, i) => {
            return {
              ...item,
              odd: values.oddsInfos.score.drawList[i].odd,
            };
          });
        values.oddsInfos.score.loseList =
          UFootball.scoreLoseOddList.map((item, i) => {
            return {
              ...item,
              odd: values.oddsInfos.score.loseList[i].odd,
            };
          });
        values.oddsInfos.goalList = UFootball.goalOddList.map(
          (item, i) => {
            return {
              ...item,
              odd: values.oddsInfos.goalList[i].odd,
            };
          },
        );
        values.oddsInfos.halfVictoryList =
          UFootball.halfVictoryOddList.map((item, i) => {
            return {
              ...item,
              odd: values.oddsInfos.halfVictoryList[i].odd,
            };
          });
        const rsp = await SFootball.saveTeamOdds(
          tempDataRef.current.id,
          values,
        );
        setState(
          produce(state, (drafState) => {
            drafState.loading = false;
          }),
        );
        if (rsp.success) {
          onCancel();
          props.onOk();
        }
      });
  }
};
export default forwardRef(FootballOddsModal);
