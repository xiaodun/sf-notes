import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Table, Space } from "antd";
import NFootball from "../NFootball";
import UCopy from "@/common/utils/UCopy";
import { produce } from "immer";
import SelfStyle from "./BonusPreviewModal.less";
import UNumber from "@/common/utils/UNumber";
export interface IBonusPreviewModal {
  showModal: (
    id: string,
    teamOddList: Array<NFootball.ITeamRecordOdds>
  ) => void;
}
export interface IBonusPreviewModalProps {}

export interface IBonusPreviewModalState {
  id: string;
  teamCount: number;
  total: number;
  currentPage: number;
  visible: boolean;
  currentResultIndex: number;
  tableLoading: boolean;
  oddResultList: Array<NFootball.IOddResult>;
}
const defaultState: IBonusPreviewModalState = {
  id: null,
  teamCount: 0,
  currentPage: 1,
  total: 0,
  visible: false,
  currentResultIndex: null,
  tableLoading: false,
  oddResultList: [],
};
const BonusPreviewModal: ForwardRefRenderFunction<
  IBonusPreviewModal,
  IBonusPreviewModalProps
> = (props, ref) => {
  const [state, setState] = useState<IBonusPreviewModalState>(defaultState);
  const allOddResultListRef = useRef<Array<NFootball.IOddResult>>([]);
  useImperativeHandle(ref, () => ({
    showModal: (id: string, teamOddList: Array<NFootball.ITeamRecordOdds>) => {
      const newState = {
        ...state,
        id,
        teamCount: teamOddList.length,
        tableLoading: true,
        visible: true,
      };
      setState(newState);
      setTimeout(() => {
        getOddResultList(newState, teamOddList);
      }, 100);
    },
  }));
  const pageSize = 5,
    spaceCount = 20;
  return (
    <Modal
      width="960px"
      title="奖金"
      maskClosable={false}
      visible={state.visible}
      bodyStyle={{ padding: "5px 24px" }}
      footer={
        <Space>
          <Button size="small" onClick={() => onResultRandom(true)}>
            随机
          </Button>
          <Button size="small" onClick={() => onResultRandom(false)}>
            预览
          </Button>
          <Button type="primary" onClick={onCancel}>
            关闭
          </Button>
        </Space>
      }
      onCancel={onCancel}
      centered
    >
      <div className={SelfStyle.main}>
        <Table
          className={
            state.currentResultIndex != null
              ? "single"
              : "count" + state.teamCount
          }
          loading={state.tableLoading}
          rowKey={() => Math.random() + ""}
          columns={[
            {
              title: "结果",
              render: renderResultColumn,
            },

            {
              title: "赔率",
              render: renderCountColumn,
            },
          ]}
          dataSource={state.oddResultList}
          pagination={{
            position: ["topCenter"],
            current: state.currentPage,
            onChange: onPageChange,
            total: state.total,
            hideOnSinglePage: true,
            simple: true,
            pageSize,
            showQuickJumper: true,
            showSizeChanger: false,
          }}
        ></Table>
      </div>
    </Modal>
  );
  function fixedWidth(char: string) {
    return `<span style="width:80px;display:inline-block">${char}</span>`;
  }
  function onPageChange(page: number) {
    setState(
      produce(state, (drafState) => {
        drafState.currentPage = page;

        drafState.oddResultList = allOddResultListRef.current.slice(
          (page - 1) * pageSize,
          page * pageSize
        );
      })
    );
  }

  function onResultRandom(isRandom: boolean) {
    setState(
      produce(state, (drafState) => {
        if (isRandom) {
          drafState.currentResultIndex =
            (Math.random() * (allOddResultListRef.current.length + 1)) | 0;
          drafState.oddResultList = [
            allOddResultListRef.current[drafState.currentResultIndex],
          ];
        } else {
          drafState.currentResultIndex = null;
          drafState.oddResultList = allOddResultListRef.current.slice(
            (state.currentPage - 1) * pageSize,
            state.currentPage * pageSize
          );
        }
      })
    );
  }

  function getOddResultList(
    newState: IBonusPreviewModalState,
    argTeamOddList: Array<NFootball.ITeamRecordOdds>
  ) {
    const teamResultOddList: Array<NFootball.ITeamResultOdds[]> = [];

    argTeamOddList.forEach((item) => {
      let list: Array<NFootball.ITeamResultOdds> = [];
      const { oddsInfos, ...restParams } = item;
      let data = {
        ...restParams,
      };

      list.push({
        ...data,
        odd: oddsInfos.singleVictory.win,
        allowSingle: item.openVictory,
        resultDesc: `${fixedWidth("胜")}@${oddsInfos.singleVictory.win}  ${
          data.homeTeam
        } vs ${data.visitingTeam}`,
        codeDesc: `${data.code} 胜`,
      });
      list.push({
        ...data,
        allowSingle: item.openVictory,
        odd: oddsInfos.singleVictory.draw,
        resultDesc: `${fixedWidth("平")}@${oddsInfos.singleVictory.draw}  ${
          data.homeTeam
        } vs  ${data.visitingTeam}`,
        codeDesc: `${data.code} 平`,
      });
      list.push({
        ...data,
        odd: oddsInfos.singleVictory.lose,
        allowSingle: item.openVictory,
        resultDesc: `${fixedWidth("负")}@${oddsInfos.singleVictory.lose}  ${
          data.homeTeam
        }  vs ${data.visitingTeam} `,
        codeDesc: `${data.code} 负`,
      });

      let handicapDesc;
      if (item.handicapCount < 0) {
        handicapDesc = "让" + Math.abs(item.handicapCount) + "球";
      } else {
        handicapDesc = "受让" + Math.abs(item.handicapCount) + "球";
      }

      list.push({
        ...data,
        allowSingle: false,
        odd: oddsInfos.handicapVictory.win,
        resultDesc: `${fixedWidth(handicapDesc + "胜")}@${
          oddsInfos.handicapVictory.win
        }  ${data.homeTeam} vs  ${data.visitingTeam} `,
        codeDesc: `${data.code} ${handicapDesc} 胜`,
      });
      list.push({
        ...data,
        allowSingle: false,
        odd: oddsInfos.handicapVictory.draw,
        resultDesc: `${fixedWidth(handicapDesc + "平")}@${
          oddsInfos.handicapVictory.draw
        }  ${data.homeTeam} vs ${data.visitingTeam} `,
        codeDesc: `${data.code} ${handicapDesc} 平`,
      });
      list.push({
        ...data,
        allowSingle: false,
        odd: oddsInfos.handicapVictory.lose,
        resultDesc: `${fixedWidth(handicapDesc + "负")}@${
          oddsInfos.handicapVictory.lose
        }  ${data.homeTeam} vs ${data.visitingTeam}`,
        codeDesc: `${data.code} ${handicapDesc} 负`,
      });
      [
        ...oddsInfos.score.winList,
        ...oddsInfos.score.drawList,
        ...oddsInfos.score.loseList,
      ].forEach((el) => {
        list.push({
          ...data,
          odd: el.odd,
          resultDesc: el.isOther
            ? `${fixedWidth(el.otherDesc)}@${el.odd}  ${data.homeTeam} vs ${
                data.visitingTeam
              } `
            : `${fixedWidth(el.home + ":" + el.visiting)}@${el.odd}  ${
                data.homeTeam
              } vs ${data.visitingTeam}`,

          codeDesc: el.isOther
            ? `${data.code} ${el.otherDesc}`
            : `${data.code} ${el.home}:${el.visiting}`,
        });
      });
      oddsInfos.goalList.forEach((el) => {
        list.push({
          ...data,
          odd: el.odd,
          resultDesc: `${fixedWidth("总进" + el.desc)}@${el.odd}  ${
            data.homeTeam
          } vs ${data.visitingTeam} `,
          codeDesc: `${data.code} 总进${el.desc}`,
        });
      });
      oddsInfos.halfVictoryList.forEach((el) => {
        list.push({
          ...data,
          odd: el.odd,
          resultDesc: `${fixedWidth(el.home + "/" + el.visiting)}@${el.odd}  ${
            data.homeTeam
          } vs ${data.visitingTeam}`,
          codeDesc: `${data.code} ${el.home}/${el.visiting} `,
        });
      });
      teamResultOddList.push(list);
    });
    let oddResultList: NFootball.IOddResult[] = [];
    let teamCombinationList: NFootball.ITeamResultOdds[][][] = [];
    getTeamCombinationList(0);
    function getTeamCombinationList(index: number) {
      const list = [];
      teamCombinationList.forEach((el) => {
        list.push([...el, teamResultOddList[index]]);
      });
      list.push([teamResultOddList[index]]);
      teamCombinationList = [...teamCombinationList, ...list];
      if (index < teamResultOddList.length - 1) {
        getTeamCombinationList(index + 1);
      }
    }

    for (let i = 0; i < teamCombinationList.length; i++) {
      const list = teamCombinationList[i];

      if (list.length === 1) {
        list[0].forEach((item) => {
          if (item.allowSingle !== false) {
            oddResultList.push({
              list: [item],

              count: item.odd,
            });
          }
        });
      } else {
        againForEach([], 0);
        function againForEach(
          againList: NFootball.ITeamResultOdds[],
          index: number
        ) {
          list[index].forEach((el) => {
            if (index === list.length - 1) {
              let data: NFootball.IOddResult = {
                list: [],

                count: 1,
              };
              [...againList, el].forEach((item) => {
                data.list.push(item);
                data.count *= item.odd;
              });
              if (argTeamOddList.length == 4 && data.count > 250000) {
                data.count = 250000;
              }
              oddResultList.push(data);
            } else {
              againForEach([...againList, el], index + 1);
            }
          });
        }
      }
    }
    oddResultList.sort((a, b) => a.count - b.count);

    allOddResultListRef.current = oddResultList;
    setState({
      ...newState,
      total: oddResultList.length,
      tableLoading: false,
      oddResultList: allOddResultListRef.current.slice(
        (state.currentPage - 1) * pageSize,
        state.currentPage * pageSize
      ),
    });
  }
  function renderCountColumn(oddResult: NFootball.IOddResult) {
    return UNumber.formatWithYuanUnit(oddResult.count);
  }
  function renderResultColumn(oddResult: NFootball.IOddResult) {
    let copyStr = "\n-------------------------------------\n";
    copyStr += oddResult.list.map((item) => item.codeDesc).join("\n");
    copyStr += "\n" + UNumber.formatWithYuanUnit(oddResult.count) + "\n\n\n";
    return (
      <div onClick={() => UCopy.copyStr(copyStr)}>
        {oddResult.list.map((item, index) => (
          <div
            key={index}
            style={{ whiteSpace: "pre-wrap", marginBottom: 8 }}
            dangerouslySetInnerHTML={{
              __html: item.resultDesc,
            }}
          ></div>
        ))}
      </div>
    );
  }
  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(BonusPreviewModal);
