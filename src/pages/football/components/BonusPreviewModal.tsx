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
import produce from "immer";
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
  const pageSize = 5;
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
          rowKey={(r) =>
            r.list.reduce((pre, item) => pre + item.resultDesc, "")
          }
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
        resultDesc: `${data.homeTeam} 胜 ${data.visitingTeam} @${oddsInfos.singleVictory.win}`,
        codeDesc: `${data.code} 胜`,
      });
      list.push({
        ...data,
        allowSingle: item.openVictory,
        odd: oddsInfos.singleVictory.draw,
        resultDesc: `${data.homeTeam} 平 ${data.visitingTeam} @${oddsInfos.singleVictory.draw}`,
        codeDesc: `${data.code} 平`,
      });
      list.push({
        ...data,
        odd: oddsInfos.singleVictory.lose,
        allowSingle: item.openVictory,
        resultDesc: `${data.homeTeam} 负 ${data.visitingTeam} @${oddsInfos.singleVictory.lose}`,
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
        resultDesc: `${data.homeTeam} ${handicapDesc} 胜 ${data.visitingTeam} @${oddsInfos.handicapVictory.win}`,
        codeDesc: `${data.code} ${handicapDesc} 胜`,
      });
      list.push({
        ...data,
        allowSingle: false,
        odd: oddsInfos.handicapVictory.draw,
        resultDesc: `${data.homeTeam} ${handicapDesc} 平 ${data.visitingTeam} @${oddsInfos.handicapVictory.draw}`,
        codeDesc: `${data.code} ${handicapDesc} 平`,
      });
      list.push({
        ...data,
        allowSingle: false,
        odd: oddsInfos.handicapVictory.lose,
        resultDesc: `${data.homeTeam} ${handicapDesc} 负 ${data.visitingTeam} @${oddsInfos.handicapVictory.lose}`,
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
            ? `${data.homeTeam} ${el.otherDesc} ${data.visitingTeam} @${el.odd}`
            : `${data.homeTeam} ${el.home}:${el.visiting} ${data.visitingTeam} @${el.odd}`,

          codeDesc: el.isOther
            ? `${data.code} ${el.otherDesc}`
            : `${data.code} ${el.home}:${el.visiting}`,
        });
      });
      oddsInfos.goalList.forEach((el) => {
        list.push({
          ...data,
          odd: el.odd,
          resultDesc: `${data.homeTeam} 总进${el.desc} ${data.visitingTeam} @${el.odd}`,
          codeDesc: `${data.code} 总进${el.desc}`,
        });
      });
      oddsInfos.halfVictoryList.forEach((el) => {
        list.push({
          ...data,
          odd: el.odd,
          resultDesc: `${data.homeTeam} ${el.home}/${el.visiting} ${data.visitingTeam} @${el.odd}`,
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
    let copyStr = oddResult.list.map((item) => item.resultDesc).join("\n");
    copyStr += "\n-------------------------------------\n";
    copyStr += oddResult.list.map((item) => item.codeDesc).join("\n");
    copyStr += "\n" + UNumber.formatWithYuanUnit(oddResult.count) + "\n\n\n";
    return (
      <div onClick={() => UCopy.copyStr(copyStr)}>
        {oddResult.list.map((item) => (
          <div>{item.resultDesc}</div>
        ))}
      </div>
    );
  }
  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(BonusPreviewModal);
