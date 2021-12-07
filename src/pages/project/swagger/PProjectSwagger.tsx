import NModel from "@/common/namespace/NModel";
import NRouter from "@/../config/router/NRouter";
import { Alert, Button, Menu, Space, Table, TableProps, Tag } from "antd";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { connect, ConnectRC, NMDGlobal, NMDProject } from "umi";
import SelfStyle from "./LProjectSwagger.less";
import SProject from "../SProject";
import EnterSwaggerModal, {
  IEnterSwaggerModal,
} from "./components/EnterSwaggerModal";
import NProject from "../NProject";
import classNames from "classnames";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import NSwagger from "@/common/namespace/NSwagger";

export interface IPProjectSwaggerProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

const PProjectSwagger: ConnectRC<IPProjectSwaggerProps> = (props) => {
  const { MDProject } = props;
  const swaggerModalRef = useRef<IEnterSwaggerModal>();
  const [
    rendMethodInfos,
    setRendMethodInfos,
  ] = useState<NProject.IRenderMethodInfo>(null);
  useEffect(() => {
    reqGetSwagger();
  }, []);
  const desColumnWidth = 450;
  const swaggerTableProps: TableProps<any> = {
    size: "small",
    indentSize: 20,
    expandable: {
      defaultExpandAllRows: true,
      expandRowByClick: false,

      expandIcon: () => null,
    },
    pagination: {
      hideOnSinglePage: true,
    },
    columns: [
      {
        title: "名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "描述",
        width: desColumnWidth,
        key: "description",
        render: (text: any, record: NProject.IRenderFormatInfo) => {
          let node: ReactNode = record.description;
          if (record.enum) {
            node = (
              <>
                <span>{record.description} 枚举:</span>
                {record.enum.map((item, index) => {
                  return (
                    <>
                      {item}
                      {index !== record.enum.length - 1 && (
                        <span style={{ color: "#a64942", padding: "0 4px" }}>
                          |
                        </span>
                      )}
                    </>
                  );
                })}
              </>
            );
          }

          return (
            <div style={{ width: desColumnWidth, wordBreak: "keep-all" }}>
              {node ? node : <span style={{ color: "#5bd1d7" }}>没有描述</span>}
            </div>
          );
        },
      },
      {
        title: "类型",
        key: "type",
        render: (text: any, record: NProject.IRenderFormatInfo) => {
          if (record.type == "array") {
            let node;
            if (record.itemsType) {
              node = `Array<${record.itemsType}> `;
            } else {
              node = "Array";
            }
            return <span style={{ color: "#ff502f" }}>{node}</span>;
          } else if (record.format) {
            return record.format;
          }

          return record.type;
        },
      },
      {
        title: "必传",
        key: "required",
        render: (text: any, record: NProject.IRenderFormatInfo) => {
          return record.required ? (
            <span style={{ color: "#ca3e47" }}> 是</span>
          ) : (
            <span> 否</span>
          );
        },
      },
    ],
  };
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
          <div className={SelfStyle.apiMenu}>{getApiMenu()}</div>

          {renderSwaggerUI()}
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
    setTimeout(() => {
      /**
          admin 医生信息 /d/admin/doctor/auditStatusList  没参数
       *   账号管理接口相关接口 /d/admin/account/cancel 有参数
       */
      setRendMethodInfos(
        rsp.list[0].data["background-admin"].tags["评论管理后台管理接口"].paths[
          "/d/admin/article/comment/listReportingCommentPage"
        ]
      );
    });
  }
  function renderSwaggerUI() {
    let contentNode: ReactNode = null;
    if (rendMethodInfos) {
      contentNode = (
        <div key={Math.random()} className={SelfStyle.apiDoc}>
          <div className={SelfStyle.baseInfo}>
            <div className={SelfStyle.itemWrap}>
              <div className="label">网关</div>
              <div className="content"></div>
            </div>
            <div className={SelfStyle.itemWrap}>
              <div className="label">路径</div>
              <div className="content">
                {rendMethodInfos.pathUrl}
                <Button type="link">复制</Button>
                <Button type="link">带网关复制</Button>
              </div>
            </div>
            <div className={SelfStyle.itemWrap}>
              <div className="label">描述</div>
              <div className="content summary">{rendMethodInfos.summary}</div>
            </div>
          </div>
          <div className={SelfStyle.paramInfo}>
            {rendMethodInfos.parameters ? (
              <>
                <div className={SelfStyle.title}>
                  <UploadOutlined />
                  请求参数
                </div>
                <Table
                  {...swaggerTableProps}
                  key={Math.random()}
                  className={SelfStyle.table}
                  dataSource={rendMethodInfos.parameters}
                ></Table>
              </>
            ) : (
              <Alert message="无需传参" type="success" showIcon />
            )}
          </div>
          <div className={SelfStyle.responseInfo}>{getResponseUI()}</div>
        </div>
      );
    }
    return contentNode;
  }
  function getResponseUI() {
    return rendMethodInfos.responses[0].type ? (
      <>
        <div className={SelfStyle.title}>
          <DownloadOutlined />
          返回格式
        </div>
        <Table
          {...swaggerTableProps}
          className={SelfStyle.table}
          dataSource={rendMethodInfos.responses}
        ></Table>
      </>
    ) : (
      <Alert message="没有返回" type="error" showIcon />
    );
  }
  function renderPathUrl(pathUrl: string) {
    const list = pathUrl.split("/").filter(Boolean);
    return <span className={SelfStyle.pathValue}>{list[list.length - 1]}</span>;
  }
  function onSelectApi(rendMethodInfos: NProject.IRenderMethodInfo) {
    setRendMethodInfos(rendMethodInfos);
  }
  function getApiMenu() {
    return (
      <Menu mode="inline" theme="light">
        {MDProject.domainSwaggerList.map((domainItem) => {
          return (
            <Menu.SubMenu key={domainItem.id} title={domainItem.domain}>
              {Object.values(domainItem.data).map((groupItem) => {
                return (
                  <Menu.SubMenu
                    key={domainItem.domain + groupItem.groupName}
                    title={groupItem.groupName}
                  >
                    {Object.values(groupItem.tags).map((tagItem, tagIndex) => {
                      return (
                        <Menu.SubMenu
                          key={
                            domainItem.domain +
                            groupItem.groupName +
                            tagItem.tagName +
                            tagIndex
                          }
                          title={tagItem.tagName}
                        >
                          {Object.values(tagItem.paths).map((pathItem) => {
                            return (
                              <Menu.Item
                                onClick={() => onSelectApi(pathItem)}
                                key={domainItem.domain + pathItem.pathUrl}
                              >
                                <Tag color="#87d068">
                                  {pathItem.method.substring(-4)}
                                </Tag>
                                {renderPathUrl(pathItem.pathUrl)}
                              </Menu.Item>
                            );
                          })}
                        </Menu.SubMenu>
                      );
                    })}
                  </Menu.SubMenu>
                );
              })}
            </Menu.SubMenu>
          );
        })}
      </Menu>
    );
  }
  function openEnterSwaggerModal() {
    swaggerModalRef.current.showModal();
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSwagger);
