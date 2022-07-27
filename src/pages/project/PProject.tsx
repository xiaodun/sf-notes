import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Dropdown, Menu, message, Space, Table, Tag } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, Link, NMDProject } from "umi";
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
import UCopy from "@/common/utils/UCopy";

export interface IProjectProps {
  MDProject: NMDProject.IState;
}

const Project: ConnectRC<IProjectProps> = (props) => {
  const { MDProject } = props;
  const directoryModalRef = useRef<IDirectoryModal>();

  useEffect(() => {
    reqGetProject();
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
        pagination={false}
      ></Table>
      <DirectoryModal
        onOk={onSelectDirectory}
        ref={directoryModalRef}
      ></DirectoryModal>
      <PageFooter>
        <Button onClick={onShowAddModal}>添加项目</Button>
        <Button>
          <Link to={NRouter.projectSwaggerPath} target="_blank">
            Swagger
          </Link>
        </Button>
      </PageFooter>
    </div>
  );
  async function onSelectDirectory(pathInfos: NSystem.IDirectory) {
    const addRsp = await SProject.addProject({
      rootPath: pathInfos.path,
    });
    if (addRsp.success) {
      reqGetList();
    } else if (!addRsp.isHaveReadMsg) {
      message.error(addRsp.message);
    }
  }

  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderOptionColumn(project: NProject) {
    let startBlock, openBlock;
    if (project.sfMock) {
      if (project.web.isStart === null) {
        startBlock = <Button loading={true} type="link"></Button>;
      } else if (project.web.isStart) {
        startBlock = <Tag color="#87d068">已启动</Tag>;

        if (!project.isSfMock && project.sfMock.serverList?.length) {
          const mockService = project.sfMock.serverList.find(
            (item) => item.isMock
          );
          let envList = project.sfMock.serverList.filter(
            (item) => !item.isMock
          );
          openBlock = (
            <Dropdown.Button
              overlay={
                <Menu>
                  {envList.length > 0 ? (
                    envList.map((item) => {
                      return (
                        <Menu.Item key={item.openUrl}>
                          <a target="_blank" href={item.openUrl}>
                            {item.name || item.openUrl}
                          </a>
                        </Menu.Item>
                      );
                    })
                  ) : (
                    <Menu.Item>没有其它环境</Menu.Item>
                  )}
                </Menu>
              }
            >
              <a target="_blank" href={mockService.openUrl}>
                打开
              </a>
            </Dropdown.Button>
          );
        }
      } else if (project.sfMock.programUrl) {
        startBlock = (
          <Button type="dashed" onClick={() => onStartProject(project)}>
            启动
          </Button>
        );
      }
    }
    return (
      <div className={SelfStyle.optionColumn}>
        <Space align="start">
          <Button type="link">
            <Link
              to={{
                pathname: NRouter.projectSnippetPath,
                search: qs.stringify({ id: project.id }),
              }}
              target="_blank"
            >
              代码片段
            </Link>
          </Button>

          {startBlock}
          {project.isSfMock && (
            <>
              <Button type="link">
                <Link
                  to={{
                    pathname: NRouter.projectSfMockPath,
                  }}
                  target="_blank"
                >
                  可视化
                </Link>
              </Button>
              <Button type="link" onClick={onUpdateSfMockConfig}>
                更新
              </Button>
            </>
          )}
          {openBlock}
        </Space>
      </div>
    );
  }
  async function onUpdateSfMockConfig() {
    const rsp = await SProject.addProject(null, true);
    if (rsp.success) {
      message.success("更新成功");
      reqGetList();
    }
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
  async function reqProjecStart(
    project: NProject,
    projectRsp: NRsp<NProject>,
    retryCount = 0
  ) {
    const startRsp = await SProject.isProjectStart(project.sfMock.programUrl);
    const index = projectRsp.list.findIndex(
      (item) => item.name === project.name
    );
    if (startRsp.success) {
      if (startRsp.data.isError) {
        if (retryCount < 2) {
          reqProjecStart(project, projectRsp, ++retryCount);
          return;
        }
      }

      projectRsp.list[index].web.isStart = startRsp.data.isStart;
      NModel.dispatch(
        new NMDProject.ARSetState({
          rsp: cloneDeep(projectRsp),
        })
      );
    }
  }
  async function reqGetProject() {
    const rsp = await SProject.getConfig();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          config: rsp.data,
        })
      );
    }
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

      rsp.list.forEach((item, index) => {
        if (item.web.isStart == null) {
          if (item.sfMock.programUrl) {
            reqProjecStart(item, newRsp);
          } else {
            newRsp.list[index].web.isStart = false;
            NModel.dispatch(
              new NMDProject.ARSetState({
                rsp: cloneDeep(newRsp),
              })
            );
          }
        }
      });
    }
  }
  function onShowAddModal() {
    directoryModalRef.current.showModal({
      startPath: MDProject.config.addBasePath,
    });
  }
};
export default connect(({ MDProject }: NModel.IState) => ({
  MDProject,
}))(Project);
