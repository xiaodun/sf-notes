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

import EditAccountModal, { IEditAccountModal } from "./EditAccountModal";

import AddRoleModal, { IAddRoleModal } from "./AddRoleModal";

export interface IRoleTabpaneProps {
  MDIterative: NMDIterative.IState;
}
const RoleTabpane: FC<IRoleTabpaneProps> = (props) => {
  const { MDIterative } = props;

  const editAccountModalRef = useRef<IEditAccountModal>();

  const addRoleModalRef = useRef<IAddRoleModal>();
  useEffect(() => {
    SIterative.getRoleList();
    SIterative.getSystemTagList();
  }, []);
  return (
    <div>
      <EditAccountModal
        MDIterative={MDIterative}
        ref={editAccountModalRef}
        onOk={SIterative.getRoleList}
      ></EditAccountModal>

      <AddRoleModal
        MDIterative={MDIterative}
        ref={addRoleModalRef}
        onOk={SIterative.getRoleList}
      ></AddRoleModal>
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

  function onShowAddRoleModal(roleTagList: NIterative.ITag[]) {
    addRoleModalRef.current.showModal();
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderOptionColumn(roles: NIterative.IRole) {
    return (
      <Space>
        <Button type="link" onClick={() => onShowEditAccountModal(roles)}>
          添加账号
        </Button>
      </Space>
    );
  }

  function onShowEditAccountModal(roles: NIterative.IRole) {
    editAccountModalRef.current.showModal(roles);
  }
};
export default RoleTabpane;
