import MockConfigModal, {
  IMockConfigModal,
} from "./components/MockConfigModal";

import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import type { SortableContainerProps, SortEnd } from "react-sortable-hoc";
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";
import {
  Button,
  Dropdown,
  Menu,
  message,
  Radio,
  Select,
  Space,
  Table,
  Tag,
} from "antd";
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
import { produce } from "immer";
import NRsp from "@/common/namespace/NRsp";
import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";
import UGitlab from "@/common/utils/UGitlab";
import { DeleteOutlined, MenuOutlined } from "@ant-design/icons";
export interface IProjectProps {
  MDProject: NMDProject.IState;
}

const Project: ConnectRC<IProjectProps> = (props) => {
  const { MDProject } = props;
  const directoryModalRef = useRef<IDirectoryModal>();

  useEffect(() => {
    reqGetProject();
    reqGetList();
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        reqGetList();
      }
    });
  }, []);

  const mockConfigModalRef = useRef<IMockConfigModal>();
  const hasSfMock = MDProject.rsp.list.some((item) => item.isSfMock);
  const DragHandle = SortableHandle(() => (
    <MenuOutlined style={{ cursor: "grab", color: "#999" }} />
  ));
  const SortableItem = SortableElement(
    (props: React.HTMLAttributes<HTMLTableRowElement>) => <tr {...props} />
  );
  const SortableBody = SortableContainer(
    (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
      <tbody {...props} />
    )
  );
  const onSortEnd = ({ oldIndex, newIndex }: SortEnd) => {
    if (oldIndex !== newIndex) {
      SProject.sortProjectList(oldIndex, newIndex, MDProject.rsp.list);
    }
  };

  const DraggableContainer = (props: SortableContainerProps) => (
    <SortableBody
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow: React.FC<any> = ({
    className,
    style,
    ...restProps
  }) => {
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = MDProject.rsp.list.findIndex(
      (x) => x.id === restProps["data-row-key"]
    );
    return <SortableItem index={index} {...restProps} />;
  };
  return (
    <div>
      <MockConfigModal ref={mockConfigModalRef}></MockConfigModal>

      <Table
        rowKey="id"
        columns={[
          {
            title: "",
            dataIndex: "_sort",
            width: 30,
            className: "drag-visible",
            render: () => <DragHandle />,
          },
          {
            title: "项目名",
            key: "name",
            render: renderNameColumn,
          },

          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MDProject.rsp.list}
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow,
          },
        }}
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
        <Radio.Group
          value={MDProject.config.nginxVisitWay}
          onChange={(e) => onChangeConfig({ nginxVisitWay: e.target.value })}
        >
          <Radio.Button value="ip">IP</Radio.Button>
          <Radio.Button value="domain">域名</Radio.Button>
        </Radio.Group>
      </PageFooter>
    </div>
  );

  function onShowMockConfigModal() {
    mockConfigModalRef.current.showModal();
  }

  function onChangeConfig(config: Partial<NProject.IConfig>) {
    SProject.updateConfig(config);
  }
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

  function renderNameColumn(project: NProject) {
    return (
      <div className={SelfStyle.nameColumn}>
        <div className="name" onClick={() => UCopy.copyStr(project.name)}>
          {project.name}
        </div>
        <Button
          shape="circle"
          icon={<DeleteOutlined />}
          onClick={() => delProject(project)}
        ></Button>
      </div>
    );
  }
  async function delProject(project: NProject) {
    const rsp = await SProject.delProject(project);
    if (rsp.success) {
      message.success("删除成功");
      reqGetList();
    }
  }
  function renderOptionColumn(project: NProject) {
    let startBlock, openBlock;
    if (project.sfMock) {
      if (project.web.isStart === null) {
        startBlock = <Button loading={true} type="link"></Button>;
      } else if (project.web.isStart) {
        startBlock = <Tag color="#87d068">已启动</Tag>;
        if (!project.isSfMock && project.sfMock.serverList?.length) {
          const serverList = project.sfMock.serverList.map((item) => ({
            ...item,
            webOpenUrl:
              MDProject.config.nginxVisitWay === "domain"
                ? item.openDomainUrl
                  ? item.openDomainUrl
                  : item.openUrl
                : item.openUrl,
          }));
          const mockService = serverList.find((item) => item.isMock);
          let envList = serverList.filter((item) => !item.isMock);
          openBlock =
            project.sfMock.serverList.length > 1 ? (
              <Dropdown.Button
                overlay={
                  <Menu>
                    {envList.map((item) => {
                      return (
                        <Menu.Item key={item.openUrl}>
                          <a target="_blank" href={item.webOpenUrl}>
                            {item.name || item.openUrl}
                          </a>
                        </Menu.Item>
                      );
                    })}
                  </Menu>
                }
              >
                <a target="_blank" href={mockService.webOpenUrl}>
                  打开
                </a>
              </Dropdown.Button>
            ) : (
              <Button>
                <a
                  target="_blank"
                  href={
                    mockService ? mockService.webOpenUrl : envList[0].webOpenUrl
                  }
                >
                  打开
                </a>
              </Button>
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
          {hasSfMock && (
            <Button type="link" onClick={onShowMockConfigModal}>
              配置
            </Button>
          )}

          {startBlock}
          {project.isSfMock && (
            <>
              <Dropdown.Button
                overlay={
                  <Menu>
                    <Menu.Item>
                      <a onClick={() => onReStartNginx()}>重启nginx</a>
                    </Menu.Item>
                    <Menu.Item>
                      <a onClick={() => onGenerateProjectStartBat()}>
                        批量生成启动项目bat文件
                      </a>
                    </Menu.Item>
                    <Menu.Item>
                      <a onClick={() => onGenerateProjectMockStructrue()}>
                        批量生成项目文件结构
                      </a>
                    </Menu.Item>
                  </Menu>
                }
              >
                <a onClick={onUpdateSfMockConfig}>更新</a>
              </Dropdown.Button>
            </>
          )}
          {openBlock}
          {MDProject.config.gitlabBasePath && !project.isSfMock && (
            <>
              <Dropdown.Button
                overlay={
                  <Menu>
                    <Menu.Item>
                      <a
                        target="_blank"
                        href={UGitlab.getNewMergeUrl(
                          MDProject.config.gitlabBasePath,
                          project.name
                        )}
                      >
                        创建合并
                      </a>
                    </Menu.Item>

                    <Menu.Item>
                      <a
                        target="_blank"
                        href={UGitlab.getMergeUrl(
                          MDProject.config.gitlabBasePath,
                          project.name
                        )}
                      >
                        处理合并
                      </a>
                    </Menu.Item>
                  </Menu>
                }
              >
                <a
                  target="_blank"
                  href={UGitlab.getProjectUrl(
                    MDProject.config.gitlabBasePath,
                    project.name
                  )}
                >
                  去主页
                </a>
              </Dropdown.Button>
            </>
          )}
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
          reqProjectStart(project, cloneDeep(MDProject.rsp));
        },
        project.isSfMock ? 3000 : 30000
      );
    }
  }
  async function reqProjectStart(
    project: NProject,
    projectRsp: NRsp<NProject>,
    retryCount = 0
  ) {
    let checkUrl = project.sfMock.programUrl;
    if (project.isSfMock) {
      checkUrl = project.sfMock.programUrl + "/example/sfNotesTestStart";
    }
    const startRsp = await SProject.isProjectStart(checkUrl);
    const index = projectRsp.list.findIndex(
      (item) => item.name === project.name
    );
    if (startRsp.success) {
      if (startRsp.data.isError) {
        if (retryCount < 2) {
          reqProjectStart(project, projectRsp, ++retryCount);
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
            reqProjectStart(item, newRsp);
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
      filter: "addedProject",
    });
  }
  async function onReStartNginx() {
    const rsp = await SProject.reStartNginx();
    if (rsp.success) {
      message.success("已执行");
    }
  }
  async function onGenerateProjectStartBat() {
    const rsp = await SProject.generateProjectStartBat();
    if (rsp.success) {
      message.success("已执行");
    }
  }
  async function onGenerateProjectMockStructrue() {
    const rsp = await SProject.generateProjectMockStructrue();
    if (rsp.success) {
      message.success("已执行");
    }
  }
};
export default connect(({ MDProject }: NModel.IState) => ({
  MDProject,
}))(Project);
