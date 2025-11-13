import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Table, Alert, Checkbox, message } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { produce } from "immer";
import { NMDFootball } from "umi";
import SFootball from "../SFootball";
import moment from "moment";
import NFootball from "../NFootball";
import UCopy from "@/common/utils/UCopy";
// @ts-ignore
import QRCode from "qrcode.react";
import UNumber from "@/common/utils/UNumber";

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
  id: "",
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
  const [qrModalVisible, setQrModalVisible] = useState<boolean>(false);
  const [qrCodeData, setQrCodeData] = useState<string>("");

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
      newSelectedRowKeys: React.Key[],
      newSelectedRows: TableRecord[]
    ) => {
      setSelectedRowKeys(newSelectedRowKeys as string[]);
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
    <>
      <Modal
        width="1200px"
        title="比赛结果"
        maskClosable={false}
        bodyStyle={{ maxHeight: "100%" }}
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

      {/* 二维码模态框 */}
      <Modal
        title="预测数据二维码"
        open={qrModalVisible}
        onCancel={() => setQrModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setQrModalVisible(false)}>
            关闭
          </Button>,
          <Button
            key="copy"
            type="primary"
            onClick={() => {
              UCopy.copyStr(qrCodeData);
            }}
          >
            复制数据
          </Button>,
        ]}
        centered
        width={400}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            {/* @ts-ignore */}
            <QRCode value={qrCodeData} size={200} level="M" />
          </div>
        </div>
      </Modal>
    </>
  );
  function getGameResultList(newState: IGameResultModalState) {
    setState(
      produce(newState, (drafState) => {
        drafState.loading = true;
      })
    );

    // 从 teamOddList 中获取日期范围
    const dateList = MDFootball.teamOddList.map((item) => item.date).sort();
    const startDate = dateList[0];
    const endDate = moment(dateList[dateList.length - 1])
      .add(1, "days")
      .format("YYYY-MM-DD");

    // 使用 getRecentMatches 替代 getGameResultList
    SFootball.getRecentMatches({
      startDate,
      endDate,
    })
      .then((recentRsp) => {
        if (!recentRsp.success) {
          setState(
            produce(newState, (drafState) => {
              drafState.loading = false;
            })
          );
          return;
        }

        // 创建 code 到 matchId 的映射（通过匹配找到）
        const codeToMatchIdMap: { [code: string]: string } = {};

        // 遍历 teamOddList，在 getRecentMatches 返回的列表中查找匹配的比赛
        MDFootball.teamOddList.forEach((teamOdd) => {
          const matchedMatch = recentRsp.data.list.find(
            (match) => match.code === teamOdd.code
          );

          if (matchedMatch) {
            // 确保 matchId 是字符串类型
            const matchIdStr =
              typeof matchedMatch.matchId === "number"
                ? String(matchedMatch.matchId)
                : matchedMatch.matchId;
            codeToMatchIdMap[teamOdd.code] = matchIdStr;
            console.log("匹配成功:", {
              code: teamOdd.code,
              matchId: matchIdStr,
              game: matchedMatch.game,
            });
          } else {
            console.log("未找到匹配:", {
              code: teamOdd.code,
              date: teamOdd.date,
              homeTeam: teamOdd.homeTeam,
              visitingTeam: teamOdd.visitingTeam,
            });
          }
        });

        // 获取所有匹配的 matchId
        const matchedMatchIds = Object.values(codeToMatchIdMap).filter(
          (id) => id
        );

        console.log("匹配结果:", {
          matchedCount: matchedMatchIds.length,
          codeToMatchIdMap,
          matchedMatchIds,
        });

        if (matchedMatchIds.length === 0) {
          console.warn("没有匹配到任何比赛，请检查日期和队伍名称是否一致");
          setState(
            produce(newState, (drafState) => {
              drafState.loading = false;
            })
          );
          return;
        }

        // 获取详细赔率信息
        SFootball.getMatchOddsDetail(matchedMatchIds)
          .then((detailRsp) => {
            if (!detailRsp.success) {
              setState(
                produce(newState, (drafState) => {
                  drafState.loading = false;
                })
              );
              return;
            }

            // 构建 matchOddsData，key 是 code
            setMatchOddsData(
              produce(matchOddsData, (draft) => {
                Object.entries(codeToMatchIdMap).forEach(([code, matchId]) => {
                  // 尝试字符串和数字两种 key
                  const detailData =
                    detailRsp.data[matchId] ||
                    detailRsp.data[Number(matchId)] ||
                    detailRsp.data[String(matchId)];
                  if (detailData) {
                    draft[code] = detailData;
                  } else {
                    console.warn("未找到详细赔率数据:", { code, matchId });
                  }
                });
              })
            );

            setState(
              produce(newState, (drafState) => {
                drafState.loading = false;
              })
            );
          })
          .catch((error) => {
            console.error("获取详细赔率失败:", error);
            setState(
              produce(newState, (drafState) => {
                drafState.loading = false;
              })
            );
          });
      })
      .catch((error) => {
        console.error("获取比赛列表失败:", error);
        setState(
          produce(newState, (drafState) => {
            drafState.loading = false;
          })
        );
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
        title: "预测",
        key: "bonusItems",
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
        title: "结果",
        key: "result",
        render: (text: string, record: TableRecord) => {
          if (Object.keys(matchOddsData).length === 0) {
            return record.isFirstRow ? "-" : null;
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

            let resultText = isWin ? "获奖" : "未中";
            let backgroundColor = isWin ? "#f6ffed" : "#fff2f0"; // 获奖用绿色背景，未中用红色背景
            let textColor = isWin ? "#52c41a" : "#ff4d4f"; // 获奖用绿色文字，未中用红色文字

            return (
              <div
                style={{
                  backgroundColor,
                  color: textColor,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  textAlign: "center",
                  fontWeight: "bold",
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
        title: "总赔率",
        key: "totalOdds",
        render: (text: string, record: TableRecord) => {
          if (record.isFirstRow) {
            return (
              <div>{UNumber.formatWithYuanUnit(record.bonusItem.count)}</div>
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
        title: "胜平负",
        key: "victory",
        render: (text: string, record: TableRecord) =>
          renderComparisonCell(record, "single"),
      },

      {
        title: "让球胜平负",
        key: "handicap",
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, "handicap"),
      },
      {
        title: "半全场",
        key: "half",
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, "half"),
      },
      {
        title: "比分",
        dataIndex: "score",
        key: "score",
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, "score"),
      },
      {
        title: "总进球",
        key: "goal",
        render: (text: unknown, record: TableRecord) =>
          renderComparisonCell(record, "goal"),
      },
      {
        title: "操作",
        dataIndex: "action",
        key: "action",
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
  function getCountOdds() {
    // 如果没有比赛结果数据，返回默认值
    if (Object.keys(matchOddsData).length === 0) {
      return "暂无比赛结果";
    }

    // 存储每个比赛的最高赔率信息
    const maxOddsList: Array<{ desc: string; odds: number }> = [];
    let totalOdds = 1;

    // 遍历所有比赛结果
    Object.values(matchOddsData).forEach((match) => {
      // 收集所有可用的赔率选项
      const oddsOptions: Array<{ desc: string; odds: number }> = [];

      // 胜平负赔率
      if (match.single && match.single > 0) {
        oddsOptions.push({
          desc: match.singleDesc,
          odds: match.single,
        });
      }

      // 让球胜平负赔率
      if (match.handicap && match.handicap > 0) {
        oddsOptions.push({
          desc: match.handicapDesc,
          odds: match.handicap,
        });
      }

      // 半全场赔率
      if (match.half && match.half > 0) {
        oddsOptions.push({
          desc: match.halfDesc,
          odds: match.half,
        });
      }

      // 总进球赔率
      if (match.goal && match.goal > 0) {
        oddsOptions.push({
          desc: match.goalDesc,
          odds: match.goal,
        });
      }

      // 比分赔率（需要转换为数字）
      if (match.score && match.scoreDesc) {
        const scoreOdds =
          typeof match.score === "string"
            ? parseFloat(match.score)
            : match.score;
        if (!isNaN(scoreOdds) && scoreOdds > 0) {
          oddsOptions.push({
            desc: match.scoreDesc,
            odds: scoreOdds,
          });
        }
      }

      // 找到最高赔率
      if (oddsOptions.length > 0) {
        const maxOdds = oddsOptions.reduce((prev, current) =>
          current.odds > prev.odds ? current : prev
        );
        maxOddsList.push(maxOdds);
        totalOdds *= maxOdds.odds;
      }
    });

    // 如果没有找到任何赔率，返回默认值
    if (maxOddsList.length === 0) {
      return "暂无有效赔率";
    }

    // 格式化展示：胜@2.3x3:0@18=总赔率
    const oddsText = maxOddsList
      .map((item) => `${item.desc}@${item.odds}`)
      .join("x");
    const totalOddsFormatted = UNumber.formatWithYuanUnit(totalOdds);

    return `${oddsText}=${totalOddsFormatted}`;
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
    return item.codeDesc.indexOf(oddInfos.halfDesc.split("").join("/")) !== -1;
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
      resultText = "",
      isCorrect = false;
    const oddInfos = matchOddsData[record.current.code] || ({} as any);
    if (Object.keys(oddInfos).length === 0) {
      return "-";
    }

    if (type === "single") {
      resultText = oddInfos.singleDesc + "@" + oddInfos.single;
      if (
        record.current.isWin ||
        record.current.isDraw ||
        record.current.isLose
      ) {
        hasPredict = true;
        isCorrect = checkSingleMatch(record.current, oddInfos);
      }
    } else if (type === "half") {
      resultText = oddInfos.halfDesc + "@" + oddInfos.half;
      if (record.current.isHalf) {
        hasPredict = true;
        isCorrect = checkHalfMatch(record.current, oddInfos);
      }
    } else if (type === "goal") {
      resultText = oddInfos.goalDesc + "@" + oddInfos.goal;
      if (record.current.isGoal) {
        isCorrect = checkGoalMatch(record.current, oddInfos);
        hasPredict = true;
      }
    } else if (type === "handicap") {
      resultText = oddInfos.handicapDesc + "@" + oddInfos.handicap;
      if (
        record.current.isHandicapWin ||
        record.current.isHandicapLose ||
        record.current.isHandicapDraw
      ) {
        hasPredict = true;
        isCorrect = checkHandicapMatch(record.current, oddInfos);
      }
    } else if (type === "score") {
      resultText = oddInfos.scoreDesc + "@" + oddInfos.score;
      if (record.current.isScore) {
        isCorrect = checkScoreMatch(record.current, oddInfos);
        hasPredict = true;
      }
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>{resultText}</span>
          {hasPredict ? (
            isCorrect ? (
              <CheckOutlined style={{ color: "#52c41a" }} />
            ) : (
              <CloseOutlined style={{ color: "#ff4d4f" }} />
            )
          ) : (
            ""
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
        item.bonusItem.list.map((item) => item.codeDesc).join("\n")
      )
      .join("\n-----------------------------------------------------------\n");

    // 设置二维码数据并显示模态框
    setQrCodeData(copyStr);
    setQrModalVisible(true);
  }
};
export default forwardRef(GameResultModal);
