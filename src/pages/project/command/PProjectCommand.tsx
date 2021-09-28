import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Space, Table, Menu } from "antd";
import React, { useEffect, useRef } from "react";
import { connect, ConnectRC, NMDGlobal, NMDProject } from "umi";
import SelfStyle from "./LProjectCommand.less";
import SSystem from "@/common/service/SSystem";
import SProject from "../SProject";
import qs from "qs";
import NProject from "../NProject";
import PageDirectory from "@/common/components/directory/PageDirectory";
export interface IPProjectOverviewProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

const PProjectOverview: ConnectRC<IPProjectOverviewProps> = (props) => {
  const { MDProject } = props;
  useEffect(() => {
    NModel.dispatch(
      new NMDGlobal.ARChangeSetting({
        controlLayout: false,
      })
    );

    pageSetup();
  }, []);

  return (
    <div className={SelfStyle.main}>
      <div style={{ width: 256 }}>
        <Menu mode="inline">
          {MDProject.commonMenuList.map((subMenu) => (
            <Menu.SubMenu key={subMenu.name} title={subMenu.name}>
              {subMenu.children.map((item) => (
                <Menu.Item key={item.name}>{item.name || "暂无名字"}</Menu.Item>
              ))}
              <Menu.Item key="_add-command">
                <Button block>添加</Button>
              </Menu.Item>
            </Menu.SubMenu>
          ))}
        </Menu>
      </div>
    </div>
  );
  function goEdit(commandId: string) {
    window.location.href =
      NRouter.projectCommandPath +
      qs.stringify(
        { commandId },
        {
          addQueryPrefix: true,
        }
      );
  }
  async function reqProjectCommad(name: string, isProject: boolean) {
    const rsp = await SProject.getCommandMenuList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          commonMenuList: rsp.list,
        })
      );
    }
  }
  async function pageSetup() {
    const rsp = await SProject.getCommandMenuList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          commonMenuList: rsp.list,
        })
      );
    }
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectOverview);
