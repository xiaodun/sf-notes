import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Button, Menu, Space, Table, Tag } from "antd";
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
  useEffect(() => {
    reqGetSwagger();
  }, []);
  return (
    <>
      <EnterSwaggerModal
        ref={swaggerModalRef}
        onOk={reqGetSwagger}
      ></EnterSwaggerModal>
      <div className={SelfStyle.main}>
        <div className={SelfStyle.optionWrap}>
          <Button onClick={openEnterSwaggerModal}>录入</Button>
        </div>
        <div className={SelfStyle.contentWrap}>
          <div className={SelfStyle.apiMenu}>
            <Menu mode="inline" theme="light">
              {getApiMenu()}
            </Menu>
          </div>
          <div className={SelfStyle.apiDoc}></div>
        </div>
      </div>
    </>
  );
  async function reqGetSwagger() {
    const rsp = await SProject.getSwaggerList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          domainSwaggerList: rsp.list,
        })
      );
    }
  }
  function renderPathUrl(pathUrl: string) {
    const list = pathUrl.split("/").filter(Boolean);
    return (
      <span>
        {list.slice(0, list.length - 1).join("/")}/
        <span className={SelfStyle.pathValue}>{list[list.length - 1]}</span>
      </span>
    );
  }
  function getApiMenu() {
    return MDProject.domainSwaggerList.map((domainItem) => {
      return (
        <Menu.SubMenu key={domainItem.id} title={domainItem.domain}>
          {Object.values(domainItem.data).map((groupItem) => {
            return (
              <Menu.SubMenu
                key={groupItem.groupName}
                title={groupItem.groupName}
              >
                {Object.values(groupItem.tags).map((tagItem, tagIndex) => {
                  return (
                    <Menu.SubMenu key={tagIndex} title={tagItem.tagName}>
                      {Object.values(tagItem.paths).map(
                        (pathItem, pathIndex) => {
                          return (
                            <Menu.Item key={pathIndex}>
                              <Tag color="#87d068">{pathItem.method}</Tag>
                              {renderPathUrl(pathItem.pathUrl)}
                            </Menu.Item>
                          );
                        }
                      )}
                    </Menu.SubMenu>
                  );
                })}
              </Menu.SubMenu>
            );
          })}
        </Menu.SubMenu>
      );
    });
  }
  function openEnterSwaggerModal() {
    swaggerModalRef.current.showModal();
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSwagger);
