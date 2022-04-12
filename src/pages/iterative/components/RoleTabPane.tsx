import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, message, Space, Table, Tag } from "antd";
import React, { FC, useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMDIterative } from "umi";
import NIterative from "../NIterative";
import SIterative from "../SIterative";
import qs from "qs";
import produce from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";

import AddRoleModal, { IAddRoleModal } from "./AddRoleModal";

export interface IRoleTabpaneProps {
  MDIterative: NMDIterative.IState;
}
const RoleTabpane: FC<IRoleTabpaneProps> = (props) => {
  const { MDIterative } = props;

  const AddRoleModalRef = useRef<IAddRoleModal>();
  useEffect(() => {
    reqGetRoleList();
  }, []);
  return (
    <div>
      <AddRoleModal ref={AddRoleModalRef} onOk={reqGetRoleList}></AddRoleModal>
      <div style={{ marginTop: "20px", marginBottom: "35px" }}>
        <Table
          rowKey="id"
          columns={[
            {
              title: "姓名",
              key: "name",
              dataIndex: "name",
              render: renderNameColumn,
            },
            {
              title: "角色",
              key: "role",
              dataIndex: "role",
            },
            {
              title: "操作",
              key: "_option",
              render: renderOptionColumn,
            },
          ]}
          dataSource={MDIterative.roleList}
          pagination={false}
        ></Table>
      </div>
      <PageFooter>
        <Button onClick={() => onShowAddRoleModal(MDIterative.roleTagList)}>
          添加角色
        </Button>
      </PageFooter>
    </div>
  );

  function onShowAddRoleModal(roleTagList: NIterative.IRoleTag[]) {
    AddRoleModalRef.current.showModal(roleTagList);
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderOptionColumn(iterative: NIterative) {
    return "";
  }
  async function reqGetRoleList() {
    const rsp = await SIterative.getRoleList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDIterative.ARSetState({
          roleList: rsp.list,
        })
      );
    }
  }
};
export default RoleTabpane;
