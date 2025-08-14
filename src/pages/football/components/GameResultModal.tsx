import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Modal, Button, Form, Input, message, Table, Alert } from 'antd';
import { produce } from 'immer';
import { NMDFootball } from 'umi';
import SFootball from '../SFootball';
import moment from 'moment';
import NFootball from '../NFootball';

export interface IGameResultModal {
  showModal: () => void;
}
export interface IGameResultModalProps {
  MDFootball: NMDFootball.IState;
}

export interface IGameResultModalState {
  loading: boolean;
  open: boolean;
  predictResult: NFootball.IPredictResult;
}
const defaultState: IGameResultModalState = {
  open: false,
  loading: false,
  predictResult: {},
};
const GameResultModal: ForwardRefRenderFunction<
  IGameResultModal,
  IGameResultModalProps
> = (props, ref) => {
  const { MDFootball } = props;
  const [state, setState] = useState<IGameResultModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: () => {
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        drafState.loading = true;
      });
      setState(newState);
      setState(
        produce(newState, (drafState) => {
          drafState.loading = false;
        })
      );
    },
  }));

  return (
    <Modal
      width="720px"
      title="比赛结果"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
      open={state.open}
      footer={
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Alert message={getCountOdds()}></Alert>
      <Table
        style={{ marginTop: 20 }}
        loading={state.loading}
        rowKey="code"
        columns={[
          {
            title: '场次',
            key: 'game',
            render: renderGameColumn,
          },
          {
            title: '结果',
            key: 'desc',
            render: renderDescColumn,
          },
        ]}
        dataSource={MDFootball.teamOddList}
        pagination={false}
      ></Table>
    </Modal>
  );
  function getCountOdds() {
    let count = 1;
    if (Object.keys(state.predictResult).length) {
      const maxOddsList = MDFootball.teamOddList.map((team) =>
        state.predictResult[team.code]
          ? Math.max(...state.predictResult[team.code].map((item) => item.odds))
          : 0
      );
      count = maxOddsList.reduce((total, cur) => (total *= cur), 1);
    }
    return '最大赔率为: ' + count;
  }
  function renderDescColumn(item: NFootball.ITeamRecordOdds) {
    const gameResultList = state.predictResult[item.code];
    return gameResultList?.[0]?.hasResult
      ? gameResultList.map((item, index) => (
          <div key={index}>{item.desc + ' @ ' + item.odds}</div>
        ))
      : '未出结果';
  }
  function renderGameColumn(item: NFootball.ITeamRecordOdds) {
    return `${item.homeTeam} VS ${item.visitingTeam} - ${item.code}`;
  }

  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(GameResultModal);
