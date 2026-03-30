import { PageFooter } from '@/common/components/page';
import NModel from '@/common/namespace/NModel';
import NRouter from '@/../config/router/NRouter';
import type { SortableContainerProps, SortEnd } from 'react-sortable-hoc';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';
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
} from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { connect, ConnectRC, Link, NMDProject, history } from 'umi';
import SelfStyle from './LProject.less';
import NProject from './NProject';
import SProject from './SProject';
import qs from 'qs';
import DirectoryModal, {
  IDirectoryModal,
} from '@/common/components/directory/combination/modal/DirectoryModal';
import StartConfigModal from './components/StartConfigModal';
import { NSystem } from '@/common/namespace/NSystem';
import { produce } from 'immer';
import NRsp from '@/common/namespace/NRsp';
import { cloneDeep } from 'lodash';
import UCopy from '@/common/utils/UCopy';
import UGitlab from '@/common/utils/UGitlab';
import { DeleteOutlined, MenuOutlined, ArrowLeftOutlined, SettingOutlined, EllipsisOutlined, CopyOutlined } from '@ant-design/icons';
import Browser from "@/utils/browser";
import SBase from '@/common/service/SBase';
import { DIRECTORY_MODAL_MEMORY_KEYS } from '@/common/components/directory/constants/directoryMemory';
export interface IProjectProps {
  MDProject: NMDProject.IState;
}

const Project: ConnectRC<IProjectProps> = (props) => {
  const { MDProject } = props;
  const directoryModalRef = useRef<IDirectoryModal>();
  const startConfigModalRef = useRef<any>();
  const [selectedProject, setSelectedProject] = useState<NProject | null>(null);
  const [localIpv4, setLocalIpv4] = useState('');

  useEffect(() => {
    reqGetProject();
    reqGetList();
    reqLocalIpv4();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        reqGetList();
      }
    });
  }, []);

  const DragHandle = SortableHandle(() => (
    <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />
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
      (x) => x.id === restProps['data-row-key']
    );
    return <SortableItem index={index} {...restProps} />;
  };
  return (
    <div>
      <Table
        rowKey="id"
        columns={[
          {
            title: '',
            dataIndex: '_sort',
            width: 30,
            className: 'drag-visible',
            render: () => <DragHandle />,
          },
          {
            title: '项目名',
            key: 'name',
            render: renderNameColumn,
          },

          {
            title: '操作',
            key: '_option',
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
        {!Browser.isMobile() && (
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => history.push("/")}
          >
            返回
          </Button>
        )}
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
      <StartConfigModal
        visible={!!selectedProject}
        onClose={() => setSelectedProject(null)}
        projectId={selectedProject?.id || 0}
        projectName={selectedProject?.name || ''}
        project={selectedProject}
        onConfigSuccess={reqGetList}
      />
    </div>
  );

  function onChangeConfig(config: Partial<NProject.IConfig>) {
    SProject.updateConfig(config);
  }
  async function onSelectDirectory(pathInfos: NSystem.IDirectory) {
    const addRsp = await SProject.addProject({
      rootPath: pathInfos.path,
    });
    if (addRsp.success) {
      reqGetProject();
      reqGetList();
    }
  }

  function renderNameColumn(project: NProject) {
    return (
      <div className={SelfStyle.nameColumn}>
        <Button
          shape="circle"
          icon={<CopyOutlined />}
          style={{ marginRight: 8 }}
          onClick={() => UCopy.copyStr(project.rootPath)}
        ></Button>
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
  async function onOpenProjectRoot(project: NProject) {
    await SBase.openFile(project.rootPath);
  }
  async function onOpenProjectCmd(project: NProject) {
    await SBase.openFile(project.rootPath, 'cmd');
  }
  async function delProject(project: NProject) {
    const rsp = await SProject.delProject(project);
    if (rsp.success) {
      reqGetList();
    }
  }
  function renderOptionColumn(project: NProject) {
    let openBlock;
    if (project.name !== 'sf-notes') {
      const openLinkList = getOpenLinkList(project);
      const menuItems = openLinkList.slice(1).map((item) => ({
        key: item.key,
        label: (
          <a target="_blank" href={item.url}>
            {item.name}
          </a>
        ),
      }));
      menuItems.push({
        key: 'open-project-root',
        label: <a onClick={() => onOpenProjectRoot(project)}>在文件夹打开</a>,
      });
      menuItems.push({
        key: 'open-project-cmd',
        label: <a onClick={() => onOpenProjectCmd(project)}>在cmd打开</a>,
      });
      openBlock = (
        <Dropdown.Button
          icon={<EllipsisOutlined />}
          menu={{
            items: menuItems,
          }}
          onClick={() => {
            if (!openLinkList.length) {
              onOpenProjectRoot(project);
            }
          }}
        >
          {openLinkList.length ? (
            <a target="_blank" href={openLinkList[0].url}>
              打开
            </a>
          ) : (
            '打开'
          )}
        </Dropdown.Button>
      );
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
              代码平台
            </Link>
          </Button>

          {project.web.isStart === null && <Button loading={true} type="link"></Button>}
          {project.web.isStart === true && <Tag color="#87d068">已启动</Tag>}
          {Boolean(project.startConfig?.commands?.length) && project.web.isStart === false && (
            <Button type="dashed" onClick={() => onStartProject(project)}>
              启动
            </Button>
          )}
          {project.name !== 'sf-notes' && (
            <Button
              icon={<SettingOutlined />}
              onClick={() => {
                setSelectedProject(project);
              }}
            />
          )}
          {project.isSfMock && (
            <>
              <Dropdown.Button
                menu={{
                  items: [
                    {
                      key: 'restart-nginx',
                      label: <a onClick={() => onReStartNginx()}>重启nginx</a>,
                    },
                    {
                      key: 'generate-structure',
                      label: (
                        <a onClick={() => onGenerateProjectMockStructrue()}>
                          批量生成项目文件结构
                        </a>
                      ),
                    },
                  ],
                }}
              >
                <a onClick={onUpdateSfMockConfig}>更新</a>
              </Dropdown.Button>
            </>
          )}
          {openBlock}
          {MDProject.config.gitlabBasePath && !project.isSfMock && (
            <>
              <Dropdown.Button
                menu={{
                  items: [
                    {
                      key: 'create-merge',
                      label: (
                        <a
                          target="_blank"
                          href={UGitlab.getNewMergeUrl(
                            MDProject.config.gitlabBasePath,
                            project.name
                          )}
                        >
                          创建合并
                        </a>
                      ),
                    },
                    {
                      key: 'handle-merge',
                      label: (
                        <a
                          target="_blank"
                          href={UGitlab.getMergeUrl(
                            MDProject.config.gitlabBasePath,
                            project.name
                          )}
                        >
                          处理合并
                        </a>
                      ),
                    },
                  ],
                }}
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
      message.success('更新成功');
      reqGetList();
    }
  }
  async function onStartProject(project: NProject) {
    const startCommands = project.startConfig?.commands || [];
    if (!startCommands.length) {
      message.error('项目未配置启动命令');
      return;
    }
    const startRsp = await SProject.startProjectWithCommands({
      projectId: project.id,
      projectName: project.name,
    });
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
      message.success('已执行');
      if (project.isSfMock) {
        onReStartNginx();
      }
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
    let checkUrl = project.startConfig?.runUrl;
    if (!checkUrl) {
      return;
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
          const checkUrl = item.startConfig?.runUrl;
          if (checkUrl) {
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
  async function reqLocalIpv4() {
    const rsp = await SBase.getIpv4();
    if (rsp.success && rsp.data) {
      setLocalIpv4(String(rsp.data).trim());
    }
  }
  function getOpenLinkList(project: NProject) {
    const runUrl = String(project.startConfig?.runUrl || '').trim();
    if (!runUrl) {
      return [];
    }
    const list: { key: string; name: string; url: string }[] = [
      {
        key: 'local',
        name: '本地链接',
        url: runUrl,
      },
    ];
    if (localIpv4) {
      const ipUrl = replaceLocalHost(runUrl, localIpv4);
      if (ipUrl && ipUrl !== runUrl) {
        list.push({
          key: 'ip',
          name: 'IP链接',
          url: ipUrl,
        });
      }
    }
    const mockItem = (project.sfMock?.serverList || []).find((item) => item.isMock);
    if (mockItem) {
      const mockUrl =
        MDProject.config.nginxVisitWay === 'domain'
          ? mockItem.openDomainUrl || mockItem.openUrl
          : mockItem.openUrl;
      if (mockUrl) {
        list.push({
          key: 'mock',
          name: 'Mock链接',
          url: mockUrl,
        });
      }
    }
    return list;
  }
  function replaceLocalHost(url: string, host: string) {
    return String(url || '').replace(
      /(https?:\/\/)(localhost|127\.0\.0\.1|0\.0\.0\.0)(?=[:/]|$)/i,
      `$1${host}`
    );
  }
  function onShowAddModal() {
    const startPath = normalizeStartPath(MDProject.config.addBasePath);
    directoryModalRef.current.showModal({
      startPath,
      filter: 'addedProject',
      memoryKey: DIRECTORY_MODAL_MEMORY_KEYS.SF_NOTES_PROJECT_ADD,
    });
  }
  function normalizeStartPath(path?: string) {
    const value = String(path || "").trim();
    if (!value) {
      return "";
    }
    const normalized = value.replace(/\\/g, "/");
    if (/^[A-Za-z]:$/.test(normalized)) {
      return `${normalized}/`;
    }
    if (/^[A-Za-z]:\/[^/]/.test(normalized)) {
      return normalized;
    }
    if (/^[A-Za-z]:[^/\\]/.test(value)) {
      return `${value.slice(0, 2)}/`;
    }
    return normalized;
  }
  async function onReStartNginx() {
    await SProject.addProject(null, true);
    const rsp = await SProject.reStartNginx();
    if (rsp.success) {
      message.success('已执行');
      reqGetList();
    }
  }
  async function onGenerateProjectMockStructrue() {
    const rsp = await SProject.generateProjectMockStructrue();
    if (rsp.success) {
      message.success('已执行');
    }
  }
};
export default connect(({ MDProject }: NModel.IState) => ({
  MDProject,
}))(Project);


