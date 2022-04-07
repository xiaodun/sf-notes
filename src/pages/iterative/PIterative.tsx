import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, message, Space, Table, Tag } from "antd";
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
export interface IIterativeProps {
  MDIterative: NMDIterative.IState;
}
const Iterative: ConnectRC<IIterativeProps> = (props) => {
  const { MDIterative } = props;

  useEffect(() => {
    reqGetConfig();
    reqGetList();
  }, []);

  return (
    <div>
      <Table
        rowKey="id"
        columns={[
          {
            title: "项目名",
            key: "name",
            dataIndex: "name",
            render: renderNameColumn,
          },

          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MDIterative.rsp.list}
        pagination={false}
      ></Table>
      <PageFooter></PageFooter>
    </div>
  );

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderOptionColumn(iterative: NIterative) {
    return "";
  }

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
};
export default connect(({ MDIterative }: NModel.IState) => ({
  MDIterative,
}))(Iterative);
