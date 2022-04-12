import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, message, Space, Table, Tag } from "antd";
import React, { FC, useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMDIterative } from "umi";
import SIterative from "../SIterative";
import qs from "qs";
import produce from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";
import NIterative from "../NIterative";

import CreateIterativeModalModal, {
  ICreateIterativeModalModal,
} from "./CreateIterativeModalModal";
import { CopyOutlined } from "@ant-design/icons";

export interface IIterativeTabpaneProps {
  MDIterative: NMDIterative.IState;
}
const IterativeTabpane: FC<IIterativeTabpaneProps> = (props) => {
  const { MDIterative } = props;

  const CreateIterativeModalModalRef = useRef<ICreateIterativeModalModal>();

  return (
    <div>
      <div style={{ marginTop: "20px", marginBottom: "35px" }}>
        <CreateIterativeModalModal
          ref={CreateIterativeModalModalRef}
          onOk={reqGetList}
        ></CreateIterativeModalModal>

        <Table
          rowKey="id"
          columns={[
            {
              title: "迭代名",
              key: "name",
              dataIndex: "name",
              render: renderNameColumn,
            },
            {
              title: "文档链接",
              key: "docUrl",
              dataIndex: "docUrl",
              render: renderDocUrlColumn,
            },
            {
              title: "文档密码",
              key: "docPassword",
              dataIndex: "docPassword",
              render: renderDocPasswordColumn,
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
      </div>
      <PageFooter>
        <Button onClick={() => onShowCreateIterativeModalModal()}>
          创建迭代
        </Button>
      </PageFooter>
    </div>
  );

  function onShowCreateIterativeModalModal() {
    CreateIterativeModalModalRef.current.showModal();
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderDocUrlColumn(docUrl: string) {
    return (
      <div>
        <CopyOutlined onClick={() => UCopy.copyStr(docUrl)}></CopyOutlined>
        &nbsp;&nbsp;<a href={docUrl}>{docUrl}</a>
      </div>
    );
  }
  function renderDocPasswordColumn(docPassword: string) {
    return <div onClick={() => UCopy.copyStr(docPassword)}>{docPassword}</div>;
  }
  function renderOptionColumn(iterative: NIterative) {
    return "";
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
export default IterativeTabpane;
