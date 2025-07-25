import NModel from "@/common/namespace/NModel";
import { Button, message, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDGlobal, NMDFootball } from "umi";
import SelfStyle from "./LFootballPredict.less";
import SFootball from "../SFootball";
import qs from "qs";
import NFootball from "../NFootball";
import { PageFooter } from "@/common/components/page";

import FootballOddsModal, {
  IFootballOddsModal,
} from "../components/FootballOddsModal";

export interface IPFootballPredictProps {
  MDFootball: NMDFootball.IState;
  MDGlobal: NMDGlobal.IState;
}

import BonusPreviewModal, {
  IBonusPreviewModal,
} from "../components/BonusPreviewModal";
import CrawlingmModal, { ICrawlingmModal } from "../components/CrawlingmModal";

import GameResultModal, {
  IGameResultModal,
} from "../components/GameResultModal";

import AddPredictModal, {
  IAddPredictModal,
} from "../components/AddPredictModal";
const PFootballPredict: ConnectRC<IPFootballPredictProps> = (props) => {
  const { MDFootball } = props;
  const footballOddsModalRef = useRef<IFootballOddsModal>();
  const bonusPreviewModalRef = useRef<IBonusPreviewModal>();
  const crawlingmModalRef = useRef<ICrawlingmModal>();
  const gameResultModalRef = useRef<IGameResultModal>();
  const addPredictModalRef = useRef<IAddPredictModal>();

  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {} as NFootball.IUrlQuery;
  useEffect(() => {
    document.title = "结果";
    SFootball.getTeamOddList(urlQuery.id);
  }, []);

  return (
    <div className={SelfStyle.main}>
      <AddPredictModal
        ref={addPredictModalRef}
        onOk={onEditOk}
      ></AddPredictModal>
      <GameResultModal
        MDFootball={MDFootball}
        ref={gameResultModalRef}
      ></GameResultModal>

      <FootballOddsModal
        onOk={onUpdateOdds}
        ref={footballOddsModalRef}
      ></FootballOddsModal>

      <BonusPreviewModal ref={bonusPreviewModalRef}></BonusPreviewModal>
      <CrawlingmModal
        MDFootball={MDFootball}
        ref={crawlingmModalRef}
        onOk={onUpdateOdds}
      ></CrawlingmModal>

      <Table
        style={{ marginBottom: 30 }}
        rowKey={(record) => record.id}
        size="small"
        columns={[
          {
            title: "场次",
            key: "team",
            render: renderTeamColumn,
          },
          {
            title: "时间",
            key: "time",
            dataIndex: "time",
          },
          // {
          //   title: "操作",
          //   key: "option",
          //   render: renderOptionColumn,
          // },
        ]}
        dataSource={MDFootball.teamOddList}
        pagination={false}
      ></Table>
      <PageFooter>
        <Button onClick={() => showEditBaseModal()}>基础信息</Button>
        <Button onClick={() => showCrawlingmModal()}>爬取</Button>
        <Button onClick={() => onShowBonusPreviewModal()}>选赔率</Button>

        <Button onClick={() => onShowGameResultModal()}>比赛结果</Button>
      </PageFooter>
    </div>
  );

  function onEditOk() {}
  function showEditBaseModal() {
    addPredictModalRef.current.showModal(true, urlQuery.id);
  }
  function onShowBonusPreviewModal() {
    if (MDFootball.teamOddList.length) {
      bonusPreviewModalRef.current.showModal(
        urlQuery.id,
        MDFootball.teamOddList
      );
    } else {
      message.error("请录入");
    }
  }

  function onShowGameResultModal() {
    gameResultModalRef.current.showModal();
  }

  function showCrawlingmModal() {
    if (MDFootball.teamOddList.length === MDFootball.config.maxGameCount) {
      message.error(`最多支持录入${MDFootball.config.maxGameCount}`);
      return;
    }
    crawlingmModalRef.current.showModal(urlQuery.id);
  }
  function onUpdateOdds() {
    SFootball.getTeamOddList(urlQuery.id);
  }
  function renderTeamColumn(teamOdds: NFootball.ITeamRecordOdds) {
    return `${teamOdds.homeTeam} VS ${teamOdds.visitingTeam}`;
  }
};
export default connect(({ MDFootball, MDGlobal }: NModel.IState) => ({
  MDFootball,
  MDGlobal,
}))(PFootballPredict);
