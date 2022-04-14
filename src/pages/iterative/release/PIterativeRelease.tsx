import { PageFooter } from "@/common/components/page";
import NModel from "@/common/namespace/NModel";
import { Button } from "antd";
import React, { useEffect, useRef } from "react";
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

  const addProjectModalRef = useRef<IAddProjectModal>();
  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {} as NIterative.IUrlQuery;
  useEffect(() => {
    SIterative.getProjectList();
    SIterative.getGitConfig();
    SIterative.getIterative(urlQuery.id);
  }, []);

  return (
    <div>
      <AddProjectModal
        MDIterative={MDIterative}
        ref={addProjectModalRef}
        onOk={() => SIterative.getIterative(urlQuery.id)}
      ></AddProjectModal>

      <PageFooter>
        <Button onClick={() => onShowAddProjectModal()}>添加项目</Button>
      </PageFooter>
    </div>
  );

  function onShowAddProjectModal() {
    addProjectModalRef.current.showModal();
  }
};
export default connect(({ MDIterative }: NModel.IState) => ({
  MDIterative,
}))(Iterative);
