import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDBook } from "umi";
import SelfStyle from "./LProject.less";
import NProject from "./NProject";
import SProject from "./SProject";

import AddProjectModal, {
  IAddProjectModalRef,
} from "./components/add/AddProjectModal";
export interface IPBookProps {
  MDBook: NMDBook.IState;
}

const PBook: ConnectRC<IPBookProps> = (props) => {
  useEffect(() => {}, []);
  const addProjectModalRef = useRef<IAddProjectModalRef>();

  return (
    <div>
      <AddProjectModal ref={addProjectModalRef}></AddProjectModal>
      <PageFooter>
        <Button onClick={onShowAddModal}>添加项目</Button>
      </PageFooter>
    </div>
  );
  function onShowAddModal() {
    addProjectModalRef.current.showModal();
  }
};
export default connect(({ MDBook }: NModel.IState) => ({
  MDBook,
}))(PBook);
