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

const PFootballPredict: ConnectRC<IPFootballPredictProps> = (props) => {
  const { MDFootball } = props;
  const refreshView = useRefreshView();

  const footballOddsModalRef = useRef<IFootballOddsModal>();

  useEffect(() => {
    document.title = "结果";
  }, []);
  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {} as NFootball.IUrlQuery;
  urlQuery.id = +urlQuery.id;
  return (
    <div className={SelfStyle.main}>
      <FootballOddsModal
        onOk={onUpdateOdds}
        ref={footballOddsModalRef}
      ></FootballOddsModal>

      <PageFooter>
        <Button onClick={showOddsModal}>录入</Button>
      </PageFooter>
    </div>
  );
  function showOddsModal() {
    footballOddsModalRef.current.showModal(urlQuery.id);
  }
  function onUpdateOdds() {}
};
export default connect(({ MDFootball, MDGlobal }: NModel.IState) => ({
  MDFootball,
  MDGlobal,
}))(PFootballPredict);
