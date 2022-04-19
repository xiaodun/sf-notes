import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { connect, ConnectRC, NMDIterative } from "umi";
import SelfStyle from "./LIterativeRelease.less";
import NIterative from "../NIterative";
import SIterative from "../SIterative";
import qs from "qs";

import { cloneDeep } from "lodash";
import UCopy from "@/common/utils/UCopy";

import AddProjectModal, {
  IAddProjectModal,
} from "./components/AddProjectModal";

export interface IIterativeReleaseProps {
  MDIterative: NMDIterative.IState;
}
const Iterative: ConnectRC<IIterativeReleaseProps> = (props) => {
  const { MDIterative } = props;
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
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
          <Button>部署</Button>
        </Space>
      </div>
      <Table
        style={{ marginBottom: 20 }}
        rowSelection={{
          type: "checkbox",
          onChange: (selectedRowKeys: React.Key[]) => {
            setSelectRowKeys(selectedRowKeys as number[]);
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
