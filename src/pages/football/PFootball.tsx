import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table, Alert } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMDFootball } from "umi";
import NFootball from "./NFootball";
import SFootball from "./SFootball";
import qs from "qs";
import UCopy from "@/common/utils/UCopy";
import moment from "moment";
export interface IFootballProps {
  MDFootball: NMDFootball.IState;
}
import AddPredictModal, {
  IAddPredictModal,
} from "./components/AddPredictModal";
import UFootball from "./UFootball";

import RecentFootballResultsModal, {
  IRecentFootballResultsModal,
} from "./components/RecentFootballResultsModal";

const Football: ConnectRC<IFootballProps> = (props) => {
  const { MDFootball } = props;
  const addPredictModalRef = useRef<IAddPredictModal>();
  const count = MDFootball.rsp.list.reduce((pre, cur) => {
    pre += cur.money || 0;
    return pre;
  }, 0);

  const recentFootballResultsModalRef = useRef<IRecentFootballResultsModal>();

  useEffect(() => {
    SFootball.getPredictList();
  }, []);

  return (
    <div>
      <AddPredictModal
        ref={addPredictModalRef}
        onOk={onAddOk}
      ></AddPredictModal>

      <RecentFootballResultsModal
        ref={recentFootballResultsModalRef}
      ></RecentFootballResultsModal>

      <Alert message={"总花费:" + count} type="info" />
      <br />
      <Alert 
        message="功能依赖于第三方接口，频繁调用会被网站拦截" 
        type="warning" 
        showIcon 
        style={{ marginBottom: 16 }}
      />
      <Table
        rowKey="id"
        columns={[
          {
            title: "名称",
            key: "name",
            dataIndex: "name",
            render: renderNameColumn,
          },
          {
            title: "日期",
            key: "id",
            dataIndex: "id",
            render: renderTimeColumn,
          },
          {
            title: "金额",
            key: "money",
            dataIndex: "money",
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
        <Button onClick={showAddModal}>添加</Button>
        <Button onClick={onShowRecentFootballResultsModal}>近期战况</Button>
      </PageFooter>
    </div>
  );

  function onShowRecentFootballResultsModal() {
    recentFootballResultsModalRef.current.showModal();
  }

  function showAddModal() {
    addPredictModalRef.current.showModal(false);
  }

  function onAddOk() {
    SFootball.getPredictList();
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderTimeColumn(id: number) {
    return (
      <div onClick={() => UCopy.copyStr(id + "")}>
        {moment(+id).format(UFootball.timeFormatStr)}
      </div>
    );
  }
  function renderOptionColumn(football: NFootball) {
    return (
      <Space>
        <Button type="link">
          <Link
            to={{
              pathname: NRouter.footballPredictPath,
              search: qs.stringify({ id: football.id }),
            }}
          >
            编辑
          </Link>
        </Button>
        <Button
          type="link"
          onClick={() => {
            SFootball.delPredict(football.id).then(() => {
              SFootball.getPredictList();
            });
          }}
        >
          删除
        </Button>
      </Space>
    );
  }
};
export default connect(({ MDFootball }: NModel.IState) => ({
  MDFootball,
}))(Football);
