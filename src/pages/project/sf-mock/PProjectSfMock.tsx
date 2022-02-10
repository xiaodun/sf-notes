import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table, Menu, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { connect, ConnectRC, NMDGlobal, NMDProject } from "umi";
import SelfStyle from "./LProjectSfMock.less";
import SProject from "../SProject";
import qs from "qs";
import NProject from "../NProject";
import PageDirectory from "@/common/components/directory/PageDirectory";
export interface IPProjectSfMockProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

const PProjectSfMock: ConnectRC<IPProjectSfMockProps> = (props) => {
  const { MDProject } = props;
  useEffect(() => {
    NModel.dispatch(
      new NMDGlobal.ARChangeSetting({
        controlLayout: false,
      })
    );
  }, []);
  const [uiKey, setUiKey] = useState("command");

  return (
    <div className={SelfStyle.main}>
      <div className={SelfStyle.leftWrap} style={{ width: 256 }}>
        <Menu mode="inline" defaultSelectedKeys={["command"]}>
          <Menu.Item key="command" onClick={() => onChangeUiKey("command")}>
            常用命令
          </Menu.Item>
        </Menu>
      </div>
      <div className={SelfStyle.rightWrap}>{renderRightUi()}</div>
    </div>
  );
  function onChangeUiKey(key: string) {
    setUiKey(key);
  }
  function renderRightUi() {
    if (uiKey === "command") {
      return (
        <>
          <Space direction="horizontal" size={30}>
            <Button onClick={() => onReStartNginx()}>重启nginx</Button>
            <Button onClick={() => onGenerateProjectStartBat()}>
              批量生成启动项目bat文件
            </Button>
            <Button onClick={() => onGenerateProjectMockStructrue()}>
              批量生成项目文件结构
            </Button>
          </Space>
        </>
      );
    }
    return "";
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
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSfMock);
