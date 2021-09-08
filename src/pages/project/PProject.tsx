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
export interface IPBookProps {
  MDProject: NMDProject.IState;
}

const PBook: ConnectRC<IPBookProps> = (props) => {
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
      <PageFooter>
        <Button onClick={onShowAddModal}>添加项目</Button>
      </PageFooter>
    </div>
  );
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
