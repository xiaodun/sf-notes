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
  id: string;
  loading: boolean;
  open: boolean;
}

interface TableRecord {
  key: string;
  bonusItem: NFootball.IOddResult;
  isFirstRow: boolean;
  itemKey: string;
  current: NFootball.ITeamResultOdds;
}
const defaultState: IGameResultModalState = {
  id: '',
  open: false,
  loading: false,
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
  const [matchOddsData, setMatchOddsData] = useState<{
    [key: string]: NFootball.IFootballMatch;
  }>({});

  // 获取预测信息
  const fetchPredictInfo = (id: string, newState: IGameResultModalState) => {
    SFootball.getPredictInfoById(id).then((predictResponse) => {
      setBonusItems(predictResponse.data.bonusItems);
      setState(
        produce(newState, (drafState) => {
          drafState.loading = false;
        })
      );
    });
  };

  useImperativeHandle(ref, () => ({
    showModal: (id: string) => {
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        drafState.id = id;
        drafState.loading = true;
      });
      setState(newState);

      fetchPredictInfo(id, newState);
      getGameResultList(newState);
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
      {/* <Alert message={getCountOdds()}></Alert> */}
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
  function getGameResultList(newState: IGameResultModalState) {
    setState(
      produce(newState, (drafState) => {
        drafState.loading = true;
      })
    );
    const dateList = MDFootball.teamOddList.map((item) => item.date).sort();
    const codeList = MDFootball.teamOddList.map((item) => item.code).sort();
    SFootball.getGameResultList(
      dateList[0],

      moment(dateList[dateList.length - 1])
        .add(1, 'days')
        .format('YYYY-MM-DD'),
      codeList
    ).then((gameRsp) => {
      let matchIds: string[] = [];

      Object.keys(gameRsp.data).forEach((key) => {
        matchIds.push(gameRsp.data[key].matchId);
      });
      SFootball.getMatchOddsDetail(matchIds).then((detailRsp) => {
        setMatchOddsData(
          produce(matchOddsData, (draft) => {
            Object.keys(gameRsp.data).forEach((codeKey) => {
              draft[codeKey] = detailRsp.data[gameRsp.data[codeKey].matchId];
            });
          })
        );
        setState(
          produce(newState, (drafState) => {
            drafState.loading = false;
          })
        );
      });
    });
  }

  function renderGameColumn(item: NFootball.ITeamRecordOdds) {
    return `${item.homeTeam} VS ${item.visitingTeam} - ${item.code}`;
  }

  function onCancel() {
    setState(defaultState);
    setBonusItems({});
    setMatchOddsData({});
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
        title: '结果',
        key: 'result',
        render: (text: string, record: TableRecord) => {
          if (Object.keys(matchOddsData).length === 0) {
            return {
              children: '-',
              props: {
                rowSpan: record.bonusItem.list.length || 1,
              },
            };
          }
          if (record.isFirstRow) {
            // 判断是否获奖
            const isWin = record.bonusItem.list.every((item) => {
              const oddInfos = matchOddsData[item.code];

              if (item.isWin || item.isDraw || item.isLose) {
                if (item.codeDesc.indexOf(oddInfos.singleDesc) !== -1) {
                  return true;
                }
              } else if (
                item.isHandicapWin ||
                item.isHandicapLose ||
                item.isHandicapDraw
              ) {
                if (
                  item.handicapCountDesc.indexOf(oddInfos.handicapDesc) !== -1
                ) {
                  return true;
                }
              } else if (oddInfos.score && item.isScore) {
                if (item.codeDesc.indexOf(oddInfos.scoreDesc) !== -1) {
                  return true;
                }
              } else if (item.isHalf) {
                if (
                  item.codeDesc.indexOf(
                    oddInfos.halfDesc.split('').join('/')
                  ) !== -1
                ) {
                  return true;
                }
              } else if (item.isGoal) {
                if (oddInfos.goalDesc.indexOf(item.goalCount) !== -1) {
                  return true;
                }
              }
              return false;
            });

            let resultText = isWin ? '获奖' : '未中';
            let backgroundColor = isWin ? '#f6ffed' : '#fff2f0'; // 获奖用绿色背景，未中用红色背景
            let textColor = isWin ? '#52c41a' : '#ff4d4f'; // 获奖用绿色文字，未中用红色文字

            return {
              children: (
                <div
                  style={{
                    backgroundColor,
                    color: textColor,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}
                >
                  {resultText}
                </div>
              ),
              props: {
                rowSpan: record.bonusItem.list.length || 1,
              },
            };
          } else {
            return {
              children: null,
              props: {
                rowSpan: 0,
              },
            };
          }
        },
      },
      {
        title: '总赔率',
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
        title: '胜平负',
        key: 'victory',
        render: (text: string, record: TableRecord) =>
          renderComparisonCell(record, 'win'),
      },

      {
        title: '让球胜平负',
        key: 'handicap',
        // render: (text: unknown, record: TableRecord) =>
        //   renderComparisonCell(record, 'handicapWin'),
      },
      {
        title: '半全场',
        key: 'half',
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
        key: 'goal',
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
                  onClick={() => handleRemove(record.itemKey)}
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

    Object.entries(bonusItems).forEach((arr, index: number) => {
      const [itemKey, item] = arr;

      item.list.forEach((current, currentIndex) => {
        dataSource.push({
          key: `${index}-${currentIndex}`,
          bonusItem: item,
          current,
          itemKey,
          isFirstRow: currentIndex === 0,
        });
      });
    });
    return dataSource;
  }

  // 渲染对比单元格
  function renderComparisonCell(record: TableRecord, field: string) {
    const bonusValue = record.current?.odd;

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
  async function handleRemove(itemKey: string) {
    const rsp = await SFootball.removeBonusItem(state.id, itemKey);
    if (rsp.success) {
      setBonusItems(
        produce(bonusItems, (draft) => {
          delete draft[itemKey];
        })
      );
    }
  }
};
export default forwardRef(GameResultModal);
