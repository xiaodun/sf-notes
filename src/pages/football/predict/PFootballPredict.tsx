import NModel from "@/common/namespace/NModel";
import {
  Affix,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Upload,
} from "antd";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { connect, ConnectRC, NMDGlobal, NMDFootball } from "umi";
import SelfStyle from "./LFootballPredict.less";
import SFootball from "../SFootball";
import qs from "qs";
import NFootball from "../NFootball";

import NFootballPredict from "./NFootballPredict";
import SyntaxHighlighter from "react-syntax-highlighter";
import produce from "immer";
import UCopy from "@/common/utils/UCopy";
import DirectoryModal, {
  IDirectoryModal,
} from "@/common/components/directory/combination/modal/DirectoryModal";
import { NSystem } from "@/common/namespace/NSystem";
import { CopyOutlined } from "@ant-design/icons";
import { isEmpty, uniqueId } from "lodash";
import SBase from "@/common/service/SBase";
import { UModal } from "@/common/utils/modal/UModal";
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

const PFootballPredict: ConnectRC<IPFootballPredictProps> = (props) => {
  const { MDFootball } = props;
  const refreshView = useRefreshView();

  const footballOddsModalRef = useRef<IFootballOddsModal>();
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
      </PageFooter>
    </div>
  );
  function showOddsModal(teamOdds: NFootball.ITeamOdds) {
    footballOddsModalRef.current.showModal(urlQuery.id, teamOdds);
  }
  function onUpdateOdds() {
    SFootball.getTeamOddList(urlQuery.id);
  }
  function renderTeamColumn(teamOdds: NFootball.ITeamOdds) {
    return `${teamOdds.homeTeam} VS ${teamOdds.visitingTeam}`;
  }
  function renderTimeColumn(teamOdds: NFootball.ITeamOdds) {
    return moment(teamOdds.time).format(UFootball.timeFormatStr);
  }
  function renderOptionColumn(teamOdds: NFootball.ITeamOdds) {
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
