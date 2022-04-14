import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, message, Space, Table, Tabs, Tag } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMDIterative } from "umi";
import SelfStyle from "./LIterative.less";
import NIterative from "./NIterative";
import SIterative from "./SIterative";
import qs from "qs";
import produce from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";

import IterativeTabpane from "./components/IterativeTabpane";
import RoleTabpane from "./components/RoleTabPane";

export interface IIterativeProps {
  MDIterative: NMDIterative.IState;
}
const Iterative: ConnectRC<IIterativeProps> = (props) => {
  const { MDIterative } = props;

  useEffect(() => {
    reqGetConfig();
    reqGetList();
    reqGetRoleTagList();
    reqGetEnvTagList();
  }, []);

  return (
    <div>
      <Tabs defaultActiveKey="role" size="large" type="card">
        <Tabs.TabPane tab="迭代" key="iterative">
          <IterativeTabpane MDIterative={MDIterative}></IterativeTabpane>
        </Tabs.TabPane>
        <Tabs.TabPane tab="角色" key="role">
          <RoleTabpane MDIterative={MDIterative}></RoleTabpane>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );

  async function reqGetConfig() {
    const rsp = await SIterative.getConfig();
    if (rsp.success) {
      NModel.dispatch(
        new NMDIterative.ARSetState({
          config: rsp.data,
        })
      );
    }
  }
  async function reqGetList() {
    const rsp = await SIterative.getIterativeList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDIterative.ARSetState({
          rsp,
        })
      );
    }
  }
  async function reqGetRoleTagList() {
    const rsp = await SIterative.getRoleTagList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDIterative.ARSetState({
          roleTagList: rsp.list,
        })
      );
    }
  }
  async function reqGetEnvTagList() {
    const rsp = await SIterative.getEnvTagList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDIterative.ARSetState({
          envTagList: rsp.list,
        })
      );
    }
  }
};
export default connect(({ MDIterative }: NModel.IState) => ({
  MDIterative,
}))(Iterative);
