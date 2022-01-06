import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDGlobal, NMDProject } from "umi";
import SelfStyle from "./LProjectSnippet.less";
import SSystem from "@/common/service/SSystem";
import SProject from "../SProject";
import qs from "qs";
import NProject from "../NProject";
import PageDirectory from "@/common/components/directory/PageDirectory";
export interface IPProjectSnippetProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

const PProjectSnippet: ConnectRC<IPProjectSnippetProps> = (props) => {
  const { MDProject } = props;
  useEffect(() => {
    NModel.dispatch(
      new NMDGlobal.ARChangeSetting({
        controlLayout: false,
      })
    );
    pageSetup();
  }, []);
  const urlQuery = (qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {}) as NProject.IUrlQuery;
  return <div>21</div>;
  async function pageSetup() {
    const projectRsp = await SProject.getProject(urlQuery.id);
    if (projectRsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          project: projectRsp.data,
        })
      );
      document.title = "代码片段 - " + projectRsp.data.name;
    }
    const snippetRsp = await SProject.getProjectSnippet(urlQuery.id);
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSnippet);
