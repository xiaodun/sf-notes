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
  Table,
  message,
} from "antd";
import produce from "immer";
import NFootball from "../NFootball";
import UFootball from "../UFootball";
import SFootball from "../SFootball";
import { NMDFootball } from "umi";
export interface ICrawlingmModal {
  showModal: (id: string) => void;
}
export interface ICrawlingmModalProps {
  onOk: () => void;
  MDFootball: NMDFootball.IState;
}

export interface ITempData {
  id: string;
}
export interface ICrawlingmModalState {
  visible: boolean;
  loading: boolean;
  gameList: Array<NFootball.IGameInfo>;
  codeList: string[];
}
const getDefaultTempData = (): ITempData => ({
  id: null,
});
const defaultState: ICrawlingmModalState = {
  visible: false,
  loading: false,
  gameList: [],
  codeList: [],
};
const CrawlingmModal: ForwardRefRenderFunction<
  ICrawlingmModal,
  ICrawlingmModalProps
> = (props, ref) => {
  const [state, setState] = useState<ICrawlingmModalState>(defaultState);
  const tempDataRef = useRef<ITempData>(getDefaultTempData());
  const [form] = Form.useForm();
  const { MDFootball } = props;
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
      bodyStyle={{ maxHeight: "670px", overflowY: "scroll" }}
      visible={state.visible}
      footer={
        <Button loading={state.loading} type="primary" onClick={onOk}>
          确定
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Table
        rowSelection={{
          type: "checkbox",
          onChange: (selectedRowKeys: React.Key[]) => {
            setState(
              produce(state, (drafState) => {
                drafState.codeList = selectedRowKeys as string[];
              })
            );
          },
        }}
        rowKey="code"
        columns={[
          {
            title: "主队",
            key: "homeTeam",
            dataIndex: "homeTeam",
          },
          {
            title: "客队",
            key: "visitingTeam",
            dataIndex: "visitingTeam",
          },
          {
            title: "日期",
            key: "time",
            dataIndex: "time",
          },
        ]}
        dataSource={state.gameList}
        pagination={false}
      ></Table>
    </Modal>
  );

  async function reqAllowGuessGame(newState: ICrawlingmModalState) {
    const rsp = await SFootball.getAllowGuessGame();
    setState(
      produce(newState, (drafState) => {
        drafState.gameList = rsp.list.filter(
          (item) =>
            MDFootball.teamOddList.findIndex((el) => el.code === item.code) ==
            -1
        );
      })
    );
  }

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    if (!state.codeList.length) {
      message.error("请选择比赛");
    } else if (
      state.codeList.length + MDFootball.teamOddList.length >
      MDFootball.config.maxGameCount
    ) {
      message.error(
        `只能再选择${
          MDFootball.config.maxGameCount - MDFootball.teamOddList.length
        }场比赛`
      );
    } else {
      setState(
        produce(state, (drafState) => {
          drafState.loading = true;
        })
      );
      for (let i = 0; i < state.codeList.length; i++) {
        const gameInfos = state.gameList.find(
          (item) => item.code == state.codeList[i]
        );
        const oddInfoRsp = await SFootball.getSingleOddInfo(
          gameInfos.code,
          gameInfos.bet_id
        );
        await SFootball.saveTeamOdds(tempDataRef.current.id, oddInfoRsp.data);
      }
      setState(
        produce(state, (drafState) => {
          drafState.loading = true;
        })
      );
      props.onOk();
      onCancel();
    }
  }
};
export default forwardRef(CrawlingmModal);
