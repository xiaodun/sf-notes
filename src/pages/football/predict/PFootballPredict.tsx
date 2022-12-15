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
export interface IPFootballPredictProps {
  MDFootball: NMDFootball.IState;
  MDGlobal: NMDGlobal.IState;
}
import useRefreshView from "@/common/hooks/useRefreshView";

import { RcCustomRequestOptions } from "antd/lib/upload/interface";

const PFootballPredict: ConnectRC<IPFootballPredictProps> = (props) => {
  const { MDFootball } = props;
  const refreshView = useRefreshView();
  useEffect(() => {
    document.title = "结果";
  }, []);

  return (
    <div className={SelfStyle.main}>
      <Tabs tabPosition="left">
        <Tabs.TabPane tab="录入" key="record">
          <Space className="record-wrap" size={100}>
            <Upload.Dragger
              accept=".xls"
              className="upload-wrapper"
              customRequest={customRequestOdds}
              showUploadList={false}
            >
              <p className="ant-upload-text">赔率录入</p>
            </Upload.Dragger>
            <Upload.Dragger
              accept=".xls"
              className="upload-wrapper"
              customRequest={customRequestResult}
              showUploadList={false}
            >
              <p className="ant-upload-text">结果录入</p>
            </Upload.Dragger>
          </Space>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
  function customRequestOdds({ file }: RcCustomRequestOptions) {
    // uploadConfigMapRef.current = produce(
    //   uploadConfigMapRef.current,
    //   (drafData) => {
    //     drafData.set(file, {
    //       uploadLoading: true,
    //       loaded: 0,
    //       total: file.size,
    //       name: file.name,
    //     });
    //   }
    // );
    // refreshView();
    // addItem(file);
  }
  function customRequestResult({ file }: RcCustomRequestOptions) {}
};
export default connect(({ MDFootball, MDGlobal }: NModel.IState) => ({
  MDFootball,
  MDGlobal,
}))(PFootballPredict);
