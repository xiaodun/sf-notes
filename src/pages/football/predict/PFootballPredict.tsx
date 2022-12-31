import NModel from "@/common/namespace/NModel";
import { Button, Space, Table } from "antd";
import React, { ReactNode, useEffect, useRef, useState } from "react";
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
import useRefreshView from "@/common/hooks/useRefreshView";
import moment from "moment";
import UFootball from "../UFootball";

import BonusPreviewModal, {
  IBonusPreviewModal,
} from "../components/BonusPreviewModal";

const PFootballPredict: ConnectRC<IPFootballPredictProps> = (props) => {
  const { MDFootball } = props;
  const footballOddsModalRef = useRef<IFootballOddsModal>();
  const bonusPreviewModalRef = useRef<IBonusPreviewModal>();
  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {} as NFootball.IUrlQuery;
  useEffect(() => {
    document.title = "结果";
    SFootball.getTeamOddList(urlQuery.id);
  }, []);

  return (
    <div className={SelfStyle.main}>
      <FootballOddsModal
        onOk={onUpdateOdds}
        ref={footballOddsModalRef}
      ></FootballOddsModal>

      <BonusPreviewModal ref={bonusPreviewModalRef}></BonusPreviewModal>

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
            render: renderTimeColumn,
          },
          {
            title: "操作",
            key: "option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MDFootball.teamOddList}
        pagination={false}
      ></Table>
      <PageFooter>
        <Button onClick={() => showOddsModal(null)}>录入</Button>
        <Button onClick={() => onShowBonusPreviewModal()}>选赔率</Button>
      </PageFooter>
    </div>
  );

  function onShowBonusPreviewModal() {
    bonusPreviewModalRef.current.showModal(urlQuery.id, MDFootball.teamOddList);
  }

  function showOddsModal(teamOdds: NFootball.ITeamRecordOdds) {
    footballOddsModalRef.current.showModal(urlQuery.id, teamOdds);
  }
  function onUpdateOdds() {
    SFootball.getTeamOddList(urlQuery.id);
  }
  function renderTeamColumn(teamOdds: NFootball.ITeamRecordOdds) {
    return `${teamOdds.homeTeam} VS ${teamOdds.visitingTeam}`;
  }
  function renderTimeColumn(teamOdds: NFootball.ITeamRecordOdds) {
    return moment(teamOdds.time).format(UFootball.timeFormatStr);
  }
  function renderOptionColumn(teamOdds: NFootball.ITeamRecordOdds) {
    return (
      <Space>
        <Button onClick={() => showOddsModal(teamOdds)} type="link">
          编辑
        </Button>
      </Space>
    );
  }
};
export default connect(({ MDFootball, MDGlobal }: NModel.IState) => ({
  MDFootball,
  MDGlobal,
}))(PFootballPredict);
