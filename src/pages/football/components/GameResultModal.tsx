import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from 'react';
import { Modal, Button, Table, Alert, Checkbox, message } from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { produce } from 'immer';
import { NMDFootball } from 'umi';
import SFootball from '../SFootball';
import moment from 'moment';
import NFootball from '../NFootball';
import UCopy from '@/common/utils/UCopy';

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
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<TableRecord[]>([]);

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
      // 重置选中状态
      setSelectedRowKeys([]);
      setSelectedRows([]);

      fetchPredictInfo(id, newState);
      getGameResultList(newState);
    },
  }));

  // 处理行选择变化
  const rowSelection = {
    selectedRowKeys,
    onChange: (
      newSelectedRowKeys: string[],
      newSelectedRows: TableRecord[]
    ) => {
      console.log(newSelectedRowKeys, newSelectedRows);

      setSelectedRowKeys(newSelectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
    renderCell: (
      checked: boolean,
      record: TableRecord,
      index: number,
      originNode: React.ReactNode
    ) => {
      if (record.isFirstRow) {
        return {
          children: originNode,
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
  };

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
      <div style={{ marginBottom: 16, marginTop: 20 }}>
        <Button
          type="primary"
          icon={<CopyOutlined />}
          onClick={handleCopySelected}
          disabled={selectedRowKeys.length === 0}
        >
          复制预测数据
        </Button>
      </div>
      <Table
        loading={state.loading}
        rowKey={(record) => record.key}
        columns={getTableColumns()}
        dataSource={getTableDataSource()}
        pagination={false}
        bordered
        rowSelection={rowSelection}
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
  function onCancel() {
    setState(defaultState);
    setBonusItems({});
    setMatchOddsData({});
    // 重置选中状态
    setSelectedRowKeys([]);
    setSelectedRows([]);
  }

  // 获取表格列配置
  function getTableColumns() {
    return [
      {
        title: '预测',
        key: 'bonusItems',
        render: (text: string, record: TableRecord) => {
          if (record.isFirstRow) {
            return (
              <div>
                {record.bonusItem.list.map((item, index) => (
                  <div
                    key={index}
                    dangerouslySetInnerHTML={{ __html: item.resultDesc }}
                  ></div>
                ))}
              </div>
            );
          }
          return null;
        },
        onCell: (record: TableRecord) => {
          if (record.isFirstRow) {
            return {
              rowSpan: record.bonusItem.list.length || 1,
            };
          }
          return {
            rowSpan: 0,
          };
        },
      },
      {
        title: '结果',
        key: 'result',
        render: (text: string, record: TableRecord) => {
          if (Object.keys(matchOddsData).length === 0) {
            return record.isFirstRow ? '-' : null;
          }
          if (record.isFirstRow) {
            // 判断是否获奖
            const isWin = record.bonusItem.list.every((item) => {
              const oddInfos = matchOddsData[item.code] || ({} as any);

              return (
                ((item.isWin || item.isDraw || item.isLose) &&
                  checkSingleMatch(item, oddInfos)) ||
                ((item.isHandicapWin ||
                  item.isHandicapLose ||
                  item.isHandicapDraw) &&
                  checkHandicapMatch(item, oddInfos)) ||
                (oddInfos.score &&
                  item.isScore &&
                  checkScoreMatch(item, oddInfos)) ||
                (item.isHalf && checkHalfMatch(item, oddInfos)) ||
                (item.isGoal && checkGoalMatch(item, oddInfos))
              );
            });

            let resultText = isWin ? '获奖' : '未中';
            let backgroundColor = isWin ? '#f6ffed' : '#fff2f0'; // 获奖用绿色背景，未中用红色背景
            let textColor = isWin ? '#52c41a' : '#ff4d4f'; // 获奖用绿色文字，未中用红色文字

            return (
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
            );
          }
          return null;
        },
        onCell: (record: TableRecord) => {
          if (record.isFirstRow) {
            return {
              rowSpan: record.bonusItem.list.length || 1,
            };
          }
          return {
            rowSpan: 0,
          };
        },
      },
      {
        title: '总赔率',
        key: 'totalOdds',
        render: (text: string, record: TableRecord) => {
          if (record.isFirstRow) {
            return (
              <div>
                {record.bonusItem.list
                  .reduce((prev, cur) => {
                    let total = prev * cur.odd;
                    return total;
                  }, 1)
                  .toFixed(2)}
              </div>
            );
          }
          return null;
        },
        onCell: (record: TableRecord) => {
          if (record.isFirstRow) {
            return {
              rowSpan: record.bonusItem.list.length || 1,
            };
          }
          return {
            rowSpan: 0,
          };
        },
      },
      {
        title: '胜平负',
        key: 'victory',
        render: (text: string, record: TableRecord) =>
          renderComparisonCell(record, 'single'),
      },

      {
        title: '让球胜平负',
        key: 'handicap',
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, 'handicap'),
      },
      {
        title: '半全场',
        key: 'half',
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, 'half'),
      },
      {
        title: '比分',
        dataIndex: 'score',
        key: 'score',
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, 'score'),
      },
      {
        title: '总进球',
        key: 'goal',
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, 'goal'),
      },
      {
        title: '操作',
        dataIndex: 'action',
        key: 'action',
        width: 100,
        render: (text: unknown, record: TableRecord) => {
          if (record.isFirstRow) {
            return (
              <Button
                type="link"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemove(record.itemKey)}
              >
                移除
              </Button>
            );
          }
          return null;
        },
        onCell: (record: TableRecord) => {
          if (record.isFirstRow) {
            return {
              rowSpan: record.bonusItem.list.length || 1,
            };
          }
          return {
            rowSpan: 0,
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

  // 检查胜平负匹配
  function checkSingleMatch(
    item: NFootball.ITeamResultOdds,
    oddInfos: NFootball.IFootballMatch
  ): boolean {
    return item.codeDesc.indexOf(oddInfos.singleDesc) !== -1;
  }

  // 检查让球匹配
  function checkHandicapMatch(
    item: NFootball.ITeamResultOdds,
    oddInfos: NFootball.IFootballMatch
  ): boolean {
    return item.handicapCountDesc.indexOf(oddInfos.handicapDesc) !== -1;
  }

  // 检查比分匹配
  function checkScoreMatch(
    item: NFootball.ITeamResultOdds,
    oddInfos: NFootball.IFootballMatch
  ): boolean {
    return item.codeDesc.indexOf(oddInfos.scoreDesc) !== -1;
  }

  // 检查半全场匹配
  function checkHalfMatch(
    item: NFootball.ITeamResultOdds,
    oddInfos: NFootball.IFootballMatch
  ): boolean {
    return item.codeDesc.indexOf(oddInfos.halfDesc.split('').join('/')) !== -1;
  }

  // 检查总进球匹配
  function checkGoalMatch(
    item: NFootball.ITeamResultOdds,
    oddInfos: NFootball.IFootballMatch
  ): boolean {
    return oddInfos.goalDesc.indexOf(item.goalCount) !== -1;
  }

  // 渲染对比单元格
  function renderComparisonCell(record: TableRecord, type: string) {
    let hasPredict = false,
      resultText = '',
      isCorrect = false;
    const oddInfos = matchOddsData[record.current.code] || ({} as any);
    if (Object.keys(oddInfos).length === 0) {
      return '-';
    }

    if (type === 'single') {
      resultText = oddInfos.singleDesc + '@' + oddInfos.single;
      if (
        record.current.isWin ||
        record.current.isDraw ||
        record.current.isLose
      ) {
        hasPredict = true;
        isCorrect = checkSingleMatch(record.current, oddInfos);
      }
    } else if (type === 'half') {
      resultText = oddInfos.halfDesc + '@' + oddInfos.half;
      if (record.current.isHalf) {
        hasPredict = true;
        isCorrect = checkHalfMatch(record.current, oddInfos);
      }
    } else if (type === 'goal') {
      resultText = oddInfos.goalDesc + '@' + oddInfos.goal;
      if (record.current.isGoal) {
        isCorrect = checkGoalMatch(record.current, oddInfos);
        hasPredict = true;
      }
    } else if (type === 'handicap') {
      resultText = oddInfos.handicapDesc + '@' + oddInfos.handicap;
      if (
        record.current.isHandicapWin ||
        record.current.isHandicapLose ||
        record.current.isHandicapDraw
      ) {
        hasPredict = true;
        isCorrect = checkHandicapMatch(record.current, oddInfos);
      }
    } else if (type === 'score') {
      resultText = oddInfos.scoreDesc + '@' + oddInfos.score;
      if (record.current.isScore) {
        isCorrect = checkScoreMatch(record.current, oddInfos);
        hasPredict = true;
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{resultText}</span>
          {hasPredict ? (
            isCorrect ? (
              <CheckOutlined style={{ color: '#52c41a' }} />
            ) : (
              <CloseOutlined style={{ color: '#ff4d4f' }} />
            )
          ) : (
            ''
          )}
        </div>
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

  // 处理复制选中的数据
  function handleCopySelected() {
    let copyStr = selectedRows
      .filter((item) => item.isFirstRow)
      .map((item) =>
        item.bonusItem.list.map((item) => item.codeDesc).join('\n')
      )
      .join('\n-----------------------------------------------------------\n');

    UCopy.copyStr(copyStr);
  }
};
export default forwardRef(GameResultModal);
