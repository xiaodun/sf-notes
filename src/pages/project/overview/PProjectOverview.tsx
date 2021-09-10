import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDProject } from "umi";
import SelfStyle from "./LProject.less";
import SSystem from "@/common/service/SSystem";
import SProject from "../SProject";
import qs from "qs";
import NProject from "../NProject";
import PageDirectory from "@/common/components/directory/PageDirectory";
export interface IPProjectOverviewProps {
  MDProject: NMDProject.IState;
}

const PProjectOverview: ConnectRC<IPProjectOverviewProps> = (props) => {
  const { MDProject } = props;
  useEffect(() => {
    pageSetup();
  }, []);
  const urlQuery = (qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {}) as NProject.IUrlQuery;
  return (
    <div>
      {MDProject.project.rootPath}
      {MDProject.project.rootPath && (
        <PageDirectory startPath={MDProject.project.rootPath}></PageDirectory>
      )}
    </div>
  );
  async function pageSetup() {
    const rsp = await SProject.getProject(urlQuery.id);
    console.log("wx", rsp);
    if (rsp.success) {
      NModel.dispatch(new NMDProject.ARSetProject(rsp.data));
    }
  }
};
export default connect(({ MDProject }: NModel.IState) => ({
  MDProject,
}))(PProjectOverview);
