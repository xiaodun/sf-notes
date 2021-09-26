import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDProject } from "umi";
import SelfStyle from "./LProject.less";
import NProject from "./NProject";
import SProject from "./SProject";
import qs from "qs";
import DirectoryModal, {
  IDirectoryModal,
} from "@/common/components/directory/combination/modal/DirectoryModal";
import { NSystem } from "@/common/namespace/NSystem";
export interface IProjectProps {
  MDProject: NMDProject.IState;
}

const Project: ConnectRC<IProjectProps> = (props) => {
  const { MDProject } = props;
  const directoryModalRef = useRef<IDirectoryModal>();

  useEffect(() => {
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
          },

          {
            title: "操作",
            key: "_option",
            render: renderOption,
          },
        ]}
        dataSource={MDProject.rsp.list}
        pagination={null}
      ></Table>
      <DirectoryModal
        onOk={onSelectDirectory}
        ref={directoryModalRef}
      ></DirectoryModal>
      <PageFooter>
        <Button onClick={onShowAddModal}>添加项目</Button>
        <Button onClick={onGoCommand}>命令管理</Button>
      </PageFooter>
    </div>
  );
  async function onSelectDirectory(pathInfos: NSystem.IDirectory) {
    const addRsp = await SProject.addProject({
      rootPath: pathInfos.path,
    });
    if (addRsp.success) {
      reqGetList();
    }
  }
  function onGoOverview(project = {} as NProject) {
    props.history.push({
      pathname: NRouter.projectOverviewPath,
      search: qs.stringify({ id: project.id }),
    });
  }
  function renderOption(project: NProject) {
    return (
      <Space align="start">
        <Button type="link" onClick={() => onGoOverview(project)}>
          进入总览
        </Button>
      </Space>
    );
  }
  function onGoCommand() {
    props.history.push({
      pathname: NRouter.projectCommandPath,
    });
  }
  async function reqGetList() {
    const rsp = await SProject.getList();
    if (rsp.success) {
      NModel.dispatch(new NMDProject.ARSetRsp(rsp));
    }
  }
  function onShowAddModal() {
    directoryModalRef.current.showModal();
  }
};
export default connect(({ MDProject }: NModel.IState) => ({
  MDProject,
}))(Project);
