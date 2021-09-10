import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDProject } from "umi";
import SelfStyle from "./LProject.less";
import NProject from "./NProject";
import SProject from "./SProject";

import AddProjectModal, {
  IAddProjectModalRef,
} from "./components/add/AddProjectModal";
import qs from "qs";
export interface IPBookProps {
  MDProject: NMDProject.IState;
}

const PBook: ConnectRC<IPBookProps> = (props) => {
  const { MDProject } = props;
  useEffect(() => {
    reqGetList();
  }, []);
  const addProjectModalRef = useRef<IAddProjectModalRef>();

  return (
    <div>
      <AddProjectModal
        ref={addProjectModalRef}
        onOk={reqGetList}
      ></AddProjectModal>
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
      <PageFooter>
        <Button onClick={onShowAddModal}>添加项目</Button>
      </PageFooter>
    </div>
  );
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
  async function reqGetList() {
    const rsp = await SProject.getList();
    if (rsp.success) {
      NModel.dispatch(new NMDProject.ARSetRsp(rsp));
    }
  }
  function onShowAddModal() {
    addProjectModalRef.current.showModal();
  }
};
export default connect(({ MDProject }: NModel.IState) => ({
  MDProject,
}))(PBook);
