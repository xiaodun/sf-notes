import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDGlobal, NMDProject } from "umi";
import SelfStyle from "./LProjectSwagger.less";
import SSystem from "@/common/service/SSystem";
import SProject from "../SProject";
import qs from "qs";
import NProject from "../NProject";
import EnterSwaggerModal, {
  IEnterSwaggerModal,
} from "./components/EnterSwaggerModal";

export interface IPProjectSwaggerProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

const PProjectSwagger: ConnectRC<IPProjectSwaggerProps> = (props) => {
  const { MDProject } = props;
  const swaggerModalRef = useRef<IEnterSwaggerModal>();

  return (
    <>
      <EnterSwaggerModal ref={swaggerModalRef}></EnterSwaggerModal>
      <div className={SelfStyle.main}>
        <div className={SelfStyle.optionWrap}>
          <Button onClick={openEnterSwaggerModal}>录入</Button>
        </div>
        <div className={SelfStyle.contentWrap}>
          <div className={SelfStyle.apiMenu}></div>
          <div className={SelfStyle.apiDoc}></div>
        </div>
      </div>
    </>
  );
  function openEnterSwaggerModal() {
    swaggerModalRef.current.showModal();
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSwagger);
