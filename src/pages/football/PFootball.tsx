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
import moment from "moment";
export interface IFootballProps {
  MDFootball: NMDFootball.IState;
}
import AddPredictModal, {
  IAddPredictModal,
} from "./components/AddPredictModal";
import UFootball from "./UFootball";

const Football: ConnectRC<IFootballProps> = (props) => {
  const { MDFootball } = props;
  const addPredictModalRef = useRef<IAddPredictModal>();

  useEffect(() => {
    SFootball.getPredictList();
  }, []);

  return (
    <div>
      <AddPredictModal
        ref={addPredictModalRef}
        onOk={onAddOk}
      ></AddPredictModal>

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
            key: "time",
            dataIndex: "time",
            render: renderTimeColumn,
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
      </PageFooter>
    </div>
  );

  function showAddModal() {
    addPredictModalRef.current.showModal();
  }

  function onAddOk() {
    SFootball.getPredictList();
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderTimeColumn(time: number) {
    return (
      <div onClick={() => UCopy.copyStr(time + "")}>
        {moment(time).format(UFootball.timeFormatStr)}
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
      </Space>
    );
  }
};
export default connect(({ MDFootball }: NModel.IState) => ({
  MDFootball,
}))(Football);
