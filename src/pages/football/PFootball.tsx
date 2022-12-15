import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, message, Space, Table, Tag } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMDFootball } from "umi";
import SelfStyle from "./LFootball.less";
import NFootball from "./NFootball";
import SFootball from "./SFootball";
import qs from "qs";
import produce from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";
export interface IFootballProps {
  MDFootball: NMDFootball.IState;
}
import AddPredictModal, {
  IAddPredictModal,
} from "./components/AddPredictModal";

const Football: ConnectRC<IFootballProps> = (props) => {
  const { MDFootball } = props;
  const addPredictModalRef = useRef<IAddPredictModal>();

  useEffect(() => {
    reqGetConfig();
    reqGetList();
  }, []);

  return (
    <div>
      <AddPredictModal ref={addPredictModalRef}></AddPredictModal>

      <Table
        rowKey="id"
        columns={[
          {
            title: "日期",
            key: "date",
            dataIndex: "date",
            render: renderDateColumn,
          },

          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MDFootball.rsp.list}
        pagination={false}
      ></Table>
      <PageFooter>
        <Button onClick={onAdd}>添加</Button>
      </PageFooter>
    </div>
  );

  function onAdd() {
    addPredictModalRef.current.showModal();
  }

  function renderDateColumn(date: string) {
    return <div onClick={() => UCopy.copyStr(date)}>{date}</div>;
  }
  function renderOptionColumn(football: NFootball) {
    return "";
  }

  async function reqGetConfig() {
    const rsp = await SFootball.getConfig();
    if (rsp.success) {
      NModel.dispatch(
        new NMDFootball.ARSetState({
          config: rsp.data,
        })
      );
    }
  }
  async function reqGetList() {
    const rsp = await SFootball.getFootballList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDFootball.ARSetState({
          rsp,
        })
      );
    }
  }
};
export default connect(({ MDFootball }: NModel.IState) => ({
  MDFootball,
}))(Football);
