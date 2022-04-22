import { PageFooter } from "@/common/components/page";
import { Button, Dropdown, Menu, Space, Table } from "antd";
import React, { FC, useRef } from "react";
import { NMDIterative } from "umi";
import NIterative from "./NIterative";
import SIterative from "./SIterative";
import UCopy from "@/common/utils/UCopy";
import EditAccountModal, {
  IEditAccountModal,
} from "./components/EditAccountModal";
import AddPersonModal, { IAddPersonModal } from "./components/AddPersonModal";
import RoleAccontInfoModal, {
  IRoleAccontInfoModal,
} from "./components/RoleAccontInfoModal";
import AddEnvModal, { IAddEnvModal } from "./components/AddEnvModal";
import AddSystemModal, { IAddSystemModal } from "./components/AddSystemModal";
import AddRoleModal, { IAddRoleModal } from "./components/AddRoleModal";
import ShowSystemInfoModalModal, {
  ISystemInfoModal,
} from "./components/SystemInfoModal";

export interface IRoleTabpaneProps {
  MDIterative: NMDIterative.IState;
}
const RoleTabpane: FC<IRoleTabpaneProps> = (props) => {
  const { MDIterative } = props;
  const addEnvModalRef = useRef<IAddEnvModal>();

  const editAccountModalRef = useRef<IEditAccountModal>();
  const addPersonModalRef = useRef<IAddPersonModal>();
  const roleAccontInfoModalRef = useRef<IRoleAccontInfoModal>();
  const addRoleModalRef = useRef<IAddRoleModal>();
  const addSystemModalRef = useRef<IAddSystemModal>();
  const showSystemInfoModalModalRef = useRef<ISystemInfoModal>();

  return (
    <div>
      <ShowSystemInfoModalModal
        MDIterative={MDIterative}
        ref={showSystemInfoModalModalRef}
      ></ShowSystemInfoModalModal>

      <AddEnvModal ref={addEnvModalRef}></AddEnvModal>

      <AddSystemModal ref={addSystemModalRef}></AddSystemModal>

      <AddRoleModal ref={addRoleModalRef}></AddRoleModal>

      <EditAccountModal
        MDIterative={MDIterative}
        ref={editAccountModalRef}
        onOk={SIterative.getPersonList}
      ></EditAccountModal>

      <AddPersonModal
        MDIterative={MDIterative}
        ref={addPersonModalRef}
        onOk={SIterative.getPersonList}
      ></AddPersonModal>

      <RoleAccontInfoModal
        MDIterative={MDIterative}
        ref={roleAccontInfoModalRef}
      ></RoleAccontInfoModal>

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
              key: "roleName",
              dataIndex: "roleName",
            },
            {
              title: "操作",
              key: "_option",
              render: renderOptionColumn,
            },
          ]}
          dataSource={MDIterative.personList}
          pagination={false}
        ></Table>
      </div>
      <PageFooter>
        <Dropdown.Button
          overlay={
            <Menu>
              <Menu.Item key={"env"} onClick={() => onShowAddEnvModal()}>
                环境
              </Menu.Item>
              <Menu.Item key={"role"} onClick={() => onShowAddRoleModal()}>
                角色
              </Menu.Item>
              <Menu.Item key={"system"} onClick={() => onShowAddSystemModal()}>
                系统
              </Menu.Item>
              <Menu.Item key={"person"} onClick={() => onShowAddPersonModal()}>
                人员
              </Menu.Item>
            </Menu>
          }
        >
          添加
        </Dropdown.Button>

        <Button onClick={() => onShowShowSystemInfoModalModal()}>
          系统信息
        </Button>
      </PageFooter>
    </div>
  );
  function onShowAddSystemModal() {
    addSystemModalRef.current.showModal();
  }
  function onShowShowSystemInfoModalModal() {
    showSystemInfoModalModalRef.current.showModal();
  }
  function onShowAddRoleModal() {
    addRoleModalRef.current.showModal();
  }

  function onShowAddEnvModal() {
    addEnvModalRef.current.showModal();
  }
  function onShowAddPersonModal() {
    addPersonModalRef.current.showModal();
  }

  function onShowRoleAccontInfoModal(roles: NIterative.IPerson) {
    roleAccontInfoModalRef.current.showModal(roles);
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderOptionColumn(roles: NIterative.IPerson) {
    return (
      <Space>
        {roles.accountList.length > 0 && (
          <Button type="link" onClick={() => onShowRoleAccontInfoModal(roles)}>
            账号信息
          </Button>
        )}

        <Button type="link" onClick={() => onShowEditAccountModal(roles)}>
          添加账号
        </Button>
      </Space>
    );
  }

  function onShowEditAccountModal(roles: NIterative.IPerson) {
    editAccountModalRef.current.showModal(roles);
  }
};
export default RoleTabpane;
