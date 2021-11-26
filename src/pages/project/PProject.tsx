import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, message, Space, Table, Tag, Typography } from "antd";
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
import SSystem from "@/common/service/SSystem";
import produce from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";

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
            render: renderNameColumn,
          },

          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
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
        <Button onClick={onGoSwagger}>Swagger</Button>
      </PageFooter>
    </div>
  );
  async function onSelectDirectory(pathInfos: NSystem.IDirectory) {
    const addRsp = await SProject.addProject({
      rootPath: pathInfos.path,
    });
    if (addRsp.success) {
      reqGetList();
    } else {
      message.error(addRsp.message);
    }
  }
  function onGoSwagger() {
    props.history.push({
      pathname: NRouter.projectSwaggerPath,
    });
  }
  function onGoOverview(project = {} as NProject) {
    props.history.push({
      pathname: NRouter.projectOverviewPath,
      search: qs.stringify({ id: project.id }),
    });
  }
  function renderNameColumn(name: string) {
    return (
      <Typography.Paragraph copyable={{ text: name }}>
        {name}
      </Typography.Paragraph>
    );
  }
  function renderOptionColumn(project: NProject) {
    let startBlock, openBlock;
    if (project.sfMock) {
      if (project.web.isStart === null) {
        startBlock = <Button loading={true} type="link"></Button>;
      } else if (project.web.isStart) {
        startBlock = <Tag color="#87d068">已启动</Tag>;
        if (!project.isSfMock && project.sfMock.openUrl) {
          openBlock = (
            <a target="_blank" href={project.sfMock.openUrl}>
              打开
            </a>
          );
        }
      } else if (project.sfMock.programUrl) {
        startBlock = (
          <Button type="link" onClick={() => onStartProject(project)}>
            启动
          </Button>
        );
      }
    }
    return (
      <Space align="start">
        <Button type="link" onClick={() => onGoOverview(project)}>
          进入总览
        </Button>

        {startBlock}
        {openBlock}
      </Space>
    );
  }
  async function onStartProject(project: NProject) {
    const startRsp = await SSystem.startBat(project.sfMock.startBatPath);
    const newRsp = produce(MDProject.rsp, (drafState) => {
      const item = drafState.list.find((item) => item.name === project.name);
      item.web.isStart = null;
    });
    NModel.dispatch(
      new NMDProject.ARSetState({
        rsp: newRsp,
      })
    );
    if (startRsp.success) {
      message.success("已执行");
      setTimeout(
        () => {
          reqProjecStart(project, cloneDeep(MDProject.rsp));
        },
        project.isSfMock ? 3000 : 30000
      );
    }
  }
  function onGoCommand() {
    props.history.push({
      pathname: NRouter.projectCommandPath,
    });
  }
  async function reqProjecStart(project: NProject, projectRsp: NRsp<NProject>) {
    let startRsp: NRsp<boolean>;
    startRsp = await SProject.isProjectStart(project.sfMock.programUrl);
    const index = projectRsp.list.findIndex(
      (item) => item.name === project.name
    );
    projectRsp.list[index].web.isStart = startRsp.success;

    NModel.dispatch(
      new NMDProject.ARSetState({
        rsp: cloneDeep(projectRsp),
      })
    );
  }
  async function reqGetList() {
    const rsp = await SProject.getProjectList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          rsp,
        })
      );
      const newRsp = cloneDeep(rsp);
      rsp.list.forEach((item) => {
        if (item.web.isStart == null) {
          reqProjecStart(item, newRsp);
        }
      });
    }
  }
  function onShowAddModal() {
    directoryModalRef.current.showModal();
  }
};
export default connect(({ MDProject }: NModel.IState) => ({
  MDProject,
}))(Project);
