import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Modal, Button, Form, Input, message, Table, Alert } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { produce } from 'immer';
import { NMDFootball } from 'umi';
import SFootball from '../SFootball';
import moment from 'moment';
import NFootball from '../NFootball';
import { cloneDeep } from 'lodash';

export interface IGameResultModal {
  showModal: (id: string) => void;
}
export interface IGameResultModalProps {
  MDFootball: NMDFootball.IState;
}

export interface IGameResultModalState {
  loading: boolean;
  open: boolean;
  predictResult: NFootball.IPredictResult;
}

interface TableRecord {
  key: string;
  bonusItem: NFootball.IOddResult;
  isFirstRow: boolean;
  [key: string]: unknown;
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
  const [bonusItems, setBonusItems] = useState<{
    [key: string]: NFootball.IOddResult;
  }>({});
  const [matchOddsData, setMatchOddsData] =
    useState<NFootball.IFootballMatch>();

  useImperativeHandle(ref, () => ({
    showModal: (id: string) => {
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        // drafState.loading = true;
      });
      setState(newState);

      // 获取预测信息
      SFootball.getPredictInfoById(id).then((predictResponse) => {
        setBonusItems(predictResponse.data.bonusItems);
        const matchIds = MDFootball.teamOddList.map((team) => team.matchId);
        // 获取比赛赔率详情
        // SFootball.getMatchOddsDetail(matchIds).then((oddsResponse) => {
        //   setMatchOddsData(oddsResponse.data);

        //   setState(
        //     produce(newState, (drafState) => {
        //       drafState.loading = false;
        //     })
        //   );
        // });
      });
    },
  }));

  return (
    <Modal
      width="1200px"
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
        columns={getTableColumns()}
        dataSource={getTableDataSource()}
        pagination={false}
        bordered
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
    setBonusItems({});
    setMatchOddsData(null);
  }

  // 获取表格列配置
  function getTableColumns() {
    return [
      {
        title: '预测',
        key: 'bonusItems',
        render: (text: string, record: TableRecord) => {
          if (record.isFirstRow) {
            return {
              children: (
                <div>
                  {record.bonusItem.list.map((item, index) => (
                    <div
                      key={index}
                      dangerouslySetInnerHTML={{ __html: item.resultDesc }}
                    ></div>
                  ))}
                </div>
              ),
              props: {
                rowSpan: record.bonusItem.list.length || 1,
              },
            };
          }
          return {
            children: null,
            props: {
              rowSpan: 0,
            },
          };
        },
      },
      {
        title: '赔率',
        key: 'totalOdds',
        render: (text: string, record: TableRecord) => {
          if (record.isFirstRow) {
            return {
              children: (
                <div>
                  {record.bonusItem.list
                    .reduce((prev, cur) => {
                      let total = prev * cur.odd;
                      return total;
                    }, 1)
                    .toFixed(2)}
                </div>
              ),
              props: {
                rowSpan: record.bonusItem.list.length || 1,
              },
            };
          }
          return {
            children: null,
            props: {
              rowSpan: 0,
            },
          };
        },
      },
      {
        title: '胜',
        dataIndex: 'win',
        key: 'win',
        // render: (text: unknown, record: TableRecord) =>
        //   renderComparisonCell(record, 'win'),
      },
      {
        title: '平',
        dataIndex: 'draw',
        key: 'draw',
        // render: (text: unknown, record: TableRecord) =>
        //   renderComparisonCell(record, 'draw'),
      },
      {
        title: '负',
        dataIndex: 'lose',
        key: 'lose',
        // render: (text: unknown, record: TableRecord) =>
        //   renderComparisonCell(record, 'lose'),
      },
      {
        title: '让球胜',
        dataIndex: 'handicapWin',
        key: 'handicapWin',
        // render: (text: unknown, record: TableRecord) =>
        //   renderComparisonCell(record, 'handicapWin'),
      },
      {
        title: '让球平',
        dataIndex: 'handicapDraw',
        key: 'handicapDraw',
        // render: (text: unknown, record: TableRecord) =>
        // renderComparisonCell(record, 'handicapDraw'),
      },
      {
        title: '让球负',
        dataIndex: 'handicapLose',
        key: 'handicapLose',
        // render: (text: unknown, record: TableRecord) =>
        // renderComparisonCell(record, 'handicapLose'),
      },
      {
        title: '半全场',
        dataIndex: 'halfFull',
        key: 'halfFull',
        // render: (text: unknown, record: TableRecord) =>
        // renderComparisonCell(record, 'halfFull'),
      },
      {
        title: '比分',
        dataIndex: 'score',
        key: 'score',
        // render: (text: unknown, record: TableRecord) =>
        // renderComparisonCell(record, 'score'),
      },
      {
        title: '总进球',
        dataIndex: 'totalGoals',
        key: 'totalGoals',
        // render: (text: unknown, record: TableRecord) =>
        // renderComparisonCell(record, 'totalGoals'),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 100,
        render: (text: unknown, record: TableRecord) => {
          if (record.isFirstRow) {
            return {
              children: (
                <Button
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(record.matchId)}
                >
                  移除
                </Button>
              ),
              props: {
                rowSpan: record.bonusItem.list.length || 1,
              },
            };
          }
          return {
            children: null,
            props: {
              rowSpan: 0,
            },
          };
        },
      },
    ];
  }

  // 获取表格数据源
  function getTableDataSource() {
    let dataSource: TableRecord[] = [];

    Object.values(cloneDeep(bonusItems)).forEach(
      (item: NFootball.IOddResult, index: number) => {
        item.list.forEach((current, currentIndex) => {
          dataSource.push({
            key: `${index}-${currentIndex}`,
            bonusItem: item,
            current,
            isFirstRow: currentIndex === 0,
          });
        });
      }
    );
    console.log(dataSource);
    // return [{}];
    return dataSource;
  }

  // 渲染对比单元格
  function renderComparisonCell(record: TableRecord, field: string) {
    const bonusValue = record.bonusItem?.[field];
    const matchOddsValue = matchOddsData?.[record.matchId]?.[field];

    if (!bonusValue && !matchOddsValue) {
      return '-';
    }

    const isMatch = bonusValue === matchOddsValue;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span>{bonusValue || '-'}</span>
        {bonusValue &&
          matchOddsValue &&
          (isMatch ? (
            <CheckOutlined style={{ color: '#52c41a' }} />
          ) : (
            <CloseOutlined style={{ color: '#ff4d4f' }} />
          ))}
      </div>
    );
  }

  // 处理移除操作
  function handleRemove(matchId: string) {
    // 这里可以添加移除逻辑
    message.success('移除成功');
  }
};
export default forwardRef(GameResultModal);
