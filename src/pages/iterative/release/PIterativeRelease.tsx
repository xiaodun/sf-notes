import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import { Button, Dropdown, Menu, Space, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { connect, ConnectRC, NMDIterative } from "umi";
import NIterative from "../NIterative";
import SIterative from "../SIterative";
import qs from "qs";
import UCopy from "@/common/utils/UCopy";
import AddProjectModal, {
  IAddProjectModal,
} from "./components/AddProjectModal";
import { UModal } from "@/common/utils/modal/UModal";
import SBase from "@/common/service/SBase";
export interface IIterativeReleaseProps {
  MDIterative: NMDIterative.IState;
}
const Iterative: ConnectRC<IIterativeReleaseProps> = (props) => {
  const { MDIterative } = props;
  const [selectProjectList, setSelectProjectList] = useState<
    NIterative.IProject[]
  >([]);
  const addProjectModalRef = useRef<IAddProjectModal>();
  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {} as NIterative.IUrlQuery;
  useEffect(() => {
    SIterative.getProjectList();
    SIterative.getGitConfig();

    reqGetIterative();
  }, []);

  return (
    <div>
      <AddProjectModal
        MDIterative={MDIterative}
        ref={addProjectModalRef}
        onOk={reqGetIterative}
      ></AddProjectModal>
      <div style={{ marginBottom: 20 }}>
        <Space size={30}>
          <Dropdown.Button
            overlay={
              <Menu>
                <Menu.Item key={"pullMaster"} onClick={() => onPullMaster()}>
                  从主分支拉取
                </Menu.Item>
                <Menu.Item key={"merge"}>合并到</Menu.Item>
                <Menu.Item key={"person"}>切换到迭代分支</Menu.Item>
              </Menu>
            }
          >
            git
          </Dropdown.Button>
          <Button>部署</Button>
        </Space>
      </div>
      <Table
        style={{ marginBottom: 20 }}
        rowSelection={{
          type: "checkbox",
          onChange: (selectedRowKeys: React.Key[]) => {
            setSelectProjectList(
              (selectedRowKeys as string[]).reduce((pre, cur) => {
                pre.push(
                  MDIterative.iteratives.projectList.find(
                    (item) => item.name === cur
                  )
                );

                return pre;
              }, [])
            );
          },
        }}
        rowKey="name"
        columns={[
          {
            title: "项目名",
            key: "name",
            dataIndex: "name",
            render: renderNameColumn,
          },
          {
            title: "分支名",
            key: "branchName",
            dataIndex: "branchName",
            render: renderBranchNameColumn,
          },

          {
            title: "操作",
            key: "_option",
            render: renderOptionColumn,
          },
        ]}
        dataSource={MDIterative.iteratives.projectList}
        pagination={false}
      ></Table>
      <PageFooter>
        <Button onClick={() => onShowAddProjectModal()}>添加项目</Button>
      </PageFooter>
    </div>
  );
  async function onCheckConflict() {
    const rsp = await SIterative.checkConflict(
      MDIterative.iteratives.id,
      selectProjectList
    );
    if (rsp.success) {
      const hasConflict = rsp.list.some((item) => item.errorMsg);
      UModal.showExecResult(rsp.list, {
        okText: hasConflict ? "打开冲突文件" : "关闭",
        onOk: () => {
          if (hasConflict) {
            const filePathList = rsp.list.reduce((pre, cur) => {
              const project = MDIterative.projectList.find(
                (item) => item.name === cur.title
              );
              if (cur.errorMsg) {
                cur.errorMsg
                  .split("\n")
                  .filter(Boolean)
                  .forEach((path) => pre.push(project.rootPath + "\\" + path));
              }
              return pre;
            }, []);

            SBase.openFile(filePathList.join(" "));
          }
        },
      });
    }
  }
  async function onPullMaster() {
    const rsp = await SIterative.pullMaster(
      MDIterative.iteratives.id,
      selectProjectList
    );
    if (rsp.success) {
      UModal.showExecResult(rsp.list, {
        width: 760,
        okText: "检测冲突",
        onOk: onCheckConflict,
      });
    }
  }
  function reqGetIterative() {
    SIterative.getIterative(urlQuery.id).then((rsp) => {
      document.title = rsp.data.name;
    });
  }
  function renderNameColumn(name: string) {
    return <div onClick={() => UCopy.copyStr(name)}>{name}</div>;
  }
  function renderBranchNameColumn(branchName: string) {
    return <div onClick={() => UCopy.copyStr(branchName)}>{branchName}</div>;
  }
  function renderOptionColumn(iterative: NIterative) {
    return (
      <Space>
        <Button type="link" onClick={() => onRemoveProject(iterative.name)}>
          删除
        </Button>
      </Space>
    );
  }
  async function onRemoveProject(name: string) {
    const rsp = await SIterative.removeProject({
      iterativeId: MDIterative.iteratives.id,
      name,
    });
    if (rsp.success) {
      reqGetIterative();
    }
  }
  function onShowAddProjectModal() {
    addProjectModalRef.current.showModal();
  }
};
export default connect(({ MDIterative }: NModel.IState) => ({
  MDIterative,
}))(Iterative);
