import NModel from "@/common/namespace/NModel";
import {
  Alert,
  Button,
  Checkbox,
  Dropdown,
  Input,
  Menu,
  Space,
  Table,
  TableProps,
  Tabs,
  Tag,
} from "antd";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { connect, ConnectRC, NMDGlobal, NMDProject } from "umi";
import SelfStyle from "./LProjectSwagger.less";
import SProject from "../SProject";
import EnterSwaggerModal, {
  IEnterSwaggerModal,
} from "./components/EnterSwaggerModal";
import NProject from "../NProject";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import UCopy from "@/common/utils/UCopy";
import { cloneDeep, isArray, isEqual, values } from "lodash";
import produce from "immer";
import GenerateAjaxCodeModal, {
  IGenerateAjaxCodeModal,
} from "./components/GenerateAjaxCodeModal";
import { URandom } from "@/common/utils/URandom";
import moment from "moment";

export interface IPProjectSwaggerProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

const PProjectSwagger: ConnectRC<IPProjectSwaggerProps> = (props) => {
  const { MDProject } = props;
  const swaggerModalRef = useRef<IEnterSwaggerModal>();
  const generateAjaxCodeRef = useRef<IGenerateAjaxCodeModal>();
  const [
    rendMethodInfos,
    setRenderMethodInfos,
  ] = useState<NProject.IRenderMethodInfo>(null);

  const [
    currentMenuCheckbox,
    setCurrentMenuCheckbox,
  ] = useState<NProject.IMenuCheckbox>(null);
  const [menActiveTabKey, setMenActiveTabKey] = useState<string>("domain");
  const [myAttentionChecked, setMyAttentionChecked] = useState<boolean>(false);
  const [searchSwaggerValue, setSearchSwaggerValue] = useState<string>("");

  useEffect(() => {
    reqGetApiPrefix();
    reqGetSwagger();
    reqGetAttentionList(true);
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
                    <span key={index}>
                      {item}
                      {index !== record.enum.length - 1 && (
                        <span style={{ color: "#a64942", padding: "0 4px" }}>
                          |
                        </span>
                      )}
                    </span>
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
      <GenerateAjaxCodeModal ref={generateAjaxCodeRef}></GenerateAjaxCodeModal>
      <div className={SelfStyle.main}>
        <div className={SelfStyle.optionWrap}>
          <Space direction="horizontal" size={20}>
            <Button onClick={openEnterSwaggerModal}>录入</Button>
            <Dropdown.Button
              overlay={
                <Menu>
                  <Menu.Item key="attention" onClick={onBatchPathAttention}>
                    关注
                  </Menu.Item>
                  <Menu.Item
                    key="cancelAttention"
                    onClick={onBatchCancelPathAttention}
                  >
                    取消关注
                  </Menu.Item>
                  <Menu.Item
                    onClick={onBatchCreateAjaxCode}
                    key="createAjaxCode"
                  >
                    生成ajax代码
                  </Menu.Item>
                  <Menu.Item
                    key="cancelMenuChecked"
                    onClick={onCancelMenuChecked}
                  >
                    取消选中
                  </Menu.Item>
                </Menu>
              }
            >
              批量操作
            </Dropdown.Button>
            <Input.Search
              allowClear
              style={{ width: 280 }}
              onPressEnter={(e) => onSearchSwagger(e.currentTarget.value)}
              onSearch={onSearchSwagger}
              enterButton
            />
          </Space>
        </div>
        <div className={SelfStyle.contentWrap}>
          <div className={SelfStyle.apiMenu}>{getApiMenu()}</div>

          {renderSwaggerUI()}
        </div>
      </div>
    </>
  );
  function showGenerateAjaxCodeModal(
    checkedPathList: NProject.IMenuCheckbox[]
  ) {
    generateAjaxCodeRef.current.showModal(checkedPathList);
  }
  async function reqGetAttentionList(isFirst: boolean) {
    const rsp = await SProject.getAttentionList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          attentionPathList: rsp.list,
        })
      );
      if (rsp.list.length && isFirst) {
        setMenActiveTabKey("attentionList");
      }
    }
  }
  async function reqGetApiPrefix() {
    const rsp = await SProject.getApiPrefixs();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          apiPrefixs: rsp.data,
        })
      );
    }
  }
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
  function onSearchSwagger(value: string) {
    setSearchSwaggerValue(value);
  }
  function renderSwaggerUI() {
    let contentNode: ReactNode = null;
    if (rendMethodInfos) {
      contentNode = (
        <div key={Math.random()} className={SelfStyle.apiDoc}>
          <div className={SelfStyle.ableWrap}>
            {menActiveTabKey === "attentionList" ? (
              <Button type="default" onClick={onCancelAttentionPath}>
                取消关注
              </Button>
            ) : (
              <Button type="default" onClick={onAttentionPath}>
                关注
              </Button>
            )}

            <Button type="default" onClick={onGenerateAjaxCode}>
              生成ajax代码
            </Button>
          </div>
          <div className={SelfStyle.baseInfo}>
            <div className={SelfStyle.itemWrap}>
              <div className="label">前缀</div>
              <div className="content">
                {renderApiPrefix(rendMethodInfos.pathUrl)}
              </div>
            </div>
            <div className={SelfStyle.itemWrap}>
              <div className="label">路径</div>
              <div className="content">
                {rendMethodInfos.pathUrl}
                <Button
                  type="link"
                  onClick={() => onCopyPathUrl(rendMethodInfos.pathUrl, false)}
                >
                  复制
                </Button>
                <Button
                  type="link"
                  onClick={() => onCopyPathUrl(rendMethodInfos.pathUrl, true)}
                >
                  带网关复制
                </Button>
              </div>
            </div>
            <div className={SelfStyle.itemWrap}>
              <div className="label">描述</div>
              <div className="content summary">{rendMethodInfos.summary}</div>
            </div>
            {menActiveTabKey === "attentionList" && (
              <>
                <div className={SelfStyle.itemWrap}>
                  <div className="label">域名</div>
                  <div className="content">{currentMenuCheckbox.domain}</div>
                </div>
                <div className={SelfStyle.itemWrap}>
                  <div className="label">分组</div>
                  <div className="content">{currentMenuCheckbox.groupName}</div>
                </div>
                <div className={SelfStyle.itemWrap}>
                  <div className="label">标签</div>
                  <div className="content">{currentMenuCheckbox.tagName}</div>
                </div>
              </>
            )}
          </div>
          <div className={SelfStyle.paramInfo}>
            {rendMethodInfos.parameters ? (
              <>
                <div className={SelfStyle.title}>
                  <div className="desc">
                    <UploadOutlined />
                    请求参数
                  </div>
                  <div className="able-wrap">
                    <Button
                      type="primary"
                      shape="round"
                      size="small"
                      onClick={() =>
                        onCopySwaggerData(rendMethodInfos.parameters, false)
                      }
                    >
                      复制
                    </Button>
                  </div>
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
  function getMenuCheckedPathUrlList() {
    const list: NProject.IMenuCheckbox[] = [];
    MDProject.menuCheckedList.forEach((menuCheckedInfos) => {
      if (menuCheckedInfos.isPath) {
        list.push(menuCheckedInfos);
      } else {
        const domainSwagger = MDProject.domainSwaggerList.find(
          (domainSwagger) => domainSwagger.domain === menuCheckedInfos.domain
        );

        Object.keys(
          domainSwagger.data[menuCheckedInfos.groupName].tags[
            menuCheckedInfos.tagName
          ].paths
        ).forEach((pathUrl) => {
          list.push({
            domain: menuCheckedInfos.domain,
            tagName: menuCheckedInfos.tagName,
            groupName: menuCheckedInfos.groupName,
            pathUrl,
            isPath: true,
          });
        });
      }
    });
    return list;
  }
  function onBatchCancelPathAttention() {
    const list = getMenuCheckedPathUrlList();

    if (list.length) {
      reqCanclePathAttention(list);
    }
  }

  function onBatchCreateAjaxCode() {
    const list = getMenuCheckedPathUrlList();

    showGenerateAjaxCodeModal(list);
  }
  function onBatchPathAttention() {
    const list = getMenuCheckedPathUrlList();

    if (list.length) {
      reqSetPathAttention(list);
    }
  }
  function onAttentionPath() {
    reqSetPathAttention([currentMenuCheckbox]);
  }
  function onGenerateAjaxCode() {
    showGenerateAjaxCodeModal([currentMenuCheckbox]);
  }
  function onCancelAttentionPath() {
    reqCanclePathAttention([currentMenuCheckbox]);
  }
  async function reqSetPathAttention(list: NProject.IMenuCheckbox[]) {
    const rsp = await SProject.setPathAttention(list);
    if (rsp.success) {
      reqGetAttentionList(false);
    }
  }
  async function reqCanclePathAttention(list: NProject.IMenuCheckbox[]) {
    const rsp = await SProject.cancelPathAttention(list);
    if (rsp.success) {
      reqGetAttentionList(false);
    }
  }
  function onCopyPathUrl(pathUrl: string, withPrefix: boolean) {
    let content = pathUrl;
    if (withPrefix) {
      content = getPrefixByPathUrl(pathUrl) + pathUrl;
    }
    UCopy.copyStr(content);
  }
  function getResponseUI() {
    return rendMethodInfos.responses[0].type ? (
      <>
        <div className={SelfStyle.title}>
          <div className="desc">
            <DownloadOutlined />
            返回格式
          </div>
          <div className="able-wrap">
            <Button
              type="primary"
              shape="round"
              size="small"
              onClick={() => onCopySwaggerData(rendMethodInfos.responses, true)}
            >
              复制
            </Button>
          </div>
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
  function onCopySwaggerData(
    rspItemList: NProject.IRenderFormatInfo[],
    isRsp: boolean
  ) {
    function able(dataLit: NProject.IRenderFormatInfo[], wrap = {}) {
      dataLit.forEach((item) => {
        if (item.type === "array") {
          wrap[item.name] = [];

          if (item.children.length) {
            wrap[item.name].push(able(item.children));
          }
        }
        if (item.type === "object") {
          wrap[item.name] = {};

          if (item.children.length) {
            wrap[item.name] = {
              ...able(item.children, {}),
            };
          }
        } else if (item.type === "boolean") {
          wrap[item.name] = URandom.getBoolean();
        } else if (item.type === "integer") {
          wrap[item.name] = 0;
        } else if (item.type === "string") {
          if (isRsp) {
            if (item.enum) {
              wrap[item.name] =
                item.enum[URandom.getIntegeValue(0, item.enum.length - 1)];
            } else if (item.format === "date-time") {
              wrap[item.name] = moment().format("YYYY-MM-DD HH:mm:ss");
            } else {
              wrap[item.name] = item.name;
            }
          } else {
            wrap[item.name] = "";
          }
        }
      });

      return wrap;
    }
    let data = {};

    able(rspItemList, data);
    if (!isRsp) {
      if (Object.keys(data).length === 1) {
        const innerObj = data[Object.keys(data)[0]];
        if (typeof innerObj === "object") {
          data = innerObj;
        }
      }
    }
    UCopy.copyStr(JSON.stringify(data));
  }
  function getPrefixByPathUrl(pathUrl: string) {
    let prefix = "";
    if (MDProject.apiPrefixs) {
      Object.keys(MDProject.apiPrefixs).find((item) => {
        if (pathUrl.startsWith(item)) {
          let config = MDProject.apiPrefixs[item];
          prefix = config.prefix;
          return true;
        }
      });
    }
    return prefix;
  }
  function renderApiPrefix(pathUrl: string) {
    const prefix = getPrefixByPathUrl(pathUrl);

    if (prefix == undefined) {
      return <span style={{ color: "#ca3e47" }}>没有配置前缀</span>;
    } else if (prefix == "") {
      return <span style={{ color: "#1ee3cf" }}>没有前缀</span>;
    } else {
      return <span style={{ color: "rgba(23,34,59,1)" }}>{prefix}</span>;
    }
  }
  function renderPathUrl(pathUrl: string) {
    const list = pathUrl.split("/").filter(Boolean);
    return <span className={SelfStyle.pathValue}>{list[list.length - 1]}</span>;
  }
  function onSelectApi(
    rendMethodInfos: NProject.IRenderMethodInfo,
    pathMenuCheckbox: NProject.IMenuCheckbox
  ) {
    setRenderMethodInfos(rendMethodInfos);
    setCurrentMenuCheckbox(pathMenuCheckbox);
  }
  function getApiMenu() {
    return (
      <>
        <Tabs activeKey={menActiveTabKey} onChange={onMenuTabChange}>
          <Tabs.TabPane key="domain" tab="域名">
            <Menu mode="inline" theme="light">
              {filterSwaggerList().map((domainItem) => {
                return (
                  <Menu.SubMenu key={domainItem.id} title={domainItem.domain}>
                    {Object.values(domainItem.data).map((groupItem) => {
                      return (
                        <Menu.SubMenu
                          key={domainItem.domain + groupItem.groupName}
                          title={groupItem.groupName}
                        >
                          {Object.values(groupItem.tags).map(
                            (tagItem, tagIndex) => {
                              const tagMenuCheckbox: NProject.IMenuCheckbox = {
                                domain: domainItem.domain,
                                groupName: groupItem.groupName,
                                tagName: tagItem.tagName,
                                isTag: true,
                              };
                              return (
                                <Menu.SubMenu
                                  key={
                                    domainItem.domain +
                                    groupItem.groupName +
                                    tagItem.tagName +
                                    tagIndex
                                  }
                                  title={
                                    <>
                                      <span onClick={(e) => onStop(e)}>
                                        <Checkbox
                                          checked={getMenuChecked(
                                            tagMenuCheckbox
                                          )}
                                          onChange={(e) =>
                                            onMenuDomainCheckedChange(
                                              e.target.checked,
                                              tagMenuCheckbox
                                            )
                                          }
                                          className={SelfStyle.tagCheckbox}
                                        ></Checkbox>
                                      </span>
                                      {tagItem.tagName}
                                    </>
                                  }
                                >
                                  {Object.values(tagItem.paths).map(
                                    (pathItem) => {
                                      const pathMenuCheckbox = {
                                        domain: domainItem.domain,
                                        groupName: groupItem.groupName,
                                        tagName: tagItem.tagName,
                                        pathUrl: pathItem.pathUrl,
                                        isPath: true,
                                      };
                                      return renderMenuPathUrl(
                                        pathMenuCheckbox,
                                        pathItem
                                      );
                                    }
                                  )}
                                </Menu.SubMenu>
                              );
                            }
                          )}
                        </Menu.SubMenu>
                      );
                    })}
                  </Menu.SubMenu>
                );
              })}
            </Menu>
          </Tabs.TabPane>
          <Tabs.TabPane key="attentionList" tab="关注">
            <Menu mode="inline" defaultOpenKeys={["myAttention"]} theme="light">
              <Menu.SubMenu
                key="myAttention"
                title={
                  <>
                    <span onClick={(e) => onStop(e)}>
                      <Checkbox
                        checked={myAttentionChecked}
                        onChange={(e) =>
                          onMenuAttentionCheckedChange(e.target.checked)
                        }
                      ></Checkbox>
                    </span>
                    我的关注
                  </>
                }
              >
                {MDProject.attentionPathList.map((pathInfos) => {
                  return renderMenuPathUrl(pathInfos, pathInfos.data);
                })}
              </Menu.SubMenu>
            </Menu>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  }
  function filterSwaggerList() {
    if (searchSwaggerValue) {
      const list: NProject.IDomainSwagger[] = [];
      MDProject.domainSwaggerList.forEach((domainItem) => {
        const searchDomainItemStr = JSON.stringify(domainItem);
        const searchDomainItem = cloneDeep(domainItem);
        searchDomainItem.data = {};
        if (searchDomainItemStr.includes(searchSwaggerValue)) {
          //搜索域名下
          list.push(searchDomainItem);
          Object.keys(domainItem.data).forEach((groupName) => {
            const groupValueStr = JSON.stringify(domainItem.data[groupName]);
            if (groupValueStr.includes(searchSwaggerValue)) {
              //搜索组下面
              const serachGroupValues = (searchDomainItem.data[
                groupName
              ] = cloneDeep(domainItem.data[groupName]));
              serachGroupValues.tags = {};
              Object.keys(domainItem.data[groupName].tags).forEach(
                (tagName) => {
                  {
                    const tagValueStr = JSON.stringify(
                      domainItem.data[groupName].tags[tagName]
                    );
                    if (tagValueStr.includes(searchSwaggerValue)) {
                      //搜索标签下面
                      const searchTagValues = (serachGroupValues.tags[
                        tagName
                      ] = cloneDeep(domainItem.data[groupName].tags[tagName]));
                      searchTagValues.paths = {};
                      Object.keys(
                        domainItem.data[groupName].tags[tagName].paths
                      ).forEach((pathUrl) => {
                        const pathValueStr = JSON.stringify(
                          domainItem.data[groupName].tags[tagName].paths[
                            pathUrl
                          ]
                        );
                        if (pathValueStr.includes(searchSwaggerValue)) {
                          //搜索路径下面
                          searchTagValues.paths[pathUrl] = cloneDeep(
                            domainItem.data[groupName].tags[tagName].paths[
                              pathUrl
                            ]
                          );
                        }
                      });
                    }
                  }
                }
              );
            }
          });
        }
      });
      return list;
    }

    return MDProject.domainSwaggerList;
  }
  function onMenuTabChange(activeKey: string) {
    setMenActiveTabKey(activeKey);
    setRenderMethodInfos(null);
    onCancelMenuChecked();
  }
  function onCancelMenuChecked() {
    setMyAttentionChecked(false);
    NModel.dispatch(
      new NMDProject.ARSetState({
        menuCheckedList: [],
      })
    );
  }
  function renderMenuPathUrl(
    pathMenuCheckbox: NProject.IMenuCheckbox,
    pathItem: NProject.IRenderMethodInfo
  ) {
    return (
      <Menu.Item
        onClick={() => {
          onSelectApi(pathItem, pathMenuCheckbox);
        }}
        key={
          pathMenuCheckbox.domain +
          pathMenuCheckbox.groupName +
          pathMenuCheckbox.tagName +
          pathItem.pathUrl
        }
      >
        <Checkbox
          checked={getMenuChecked(pathMenuCheckbox)}
          onChange={(e) =>
            onMenuDomainCheckedChange(e.target.checked, pathMenuCheckbox)
          }
          className={SelfStyle.pathCheckbox}
        ></Checkbox>
        <Tag color="#87d068">{pathItem.method.substring(-4)}</Tag>
        {renderPathUrl(pathItem.pathUrl)}
      </Menu.Item>
    );
  }
  function onStop(event: React.MouseEvent) {
    event.stopPropagation();
  }
  function onMenuAttentionCheckedChange(checked: boolean) {
    let list: NProject.IMenuCheckbox[] = [];
    if (checked) {
      list = MDProject.attentionPathList;
    }
    setMyAttentionChecked(checked);
    NModel.dispatch(
      new NMDProject.ARSetState({
        menuCheckedList: list,
      })
    );
  }
  function getMenuChecked(params: NProject.IMenuCheckbox) {
    return MDProject.menuCheckedList.some((item) => isEqual(params, item));
  }
  function onMenuDomainCheckedChange(
    checked: boolean,
    params: NProject.IMenuCheckbox
  ) {
    if (checked) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          menuCheckedList: [...MDProject.menuCheckedList, params],
        })
      );
    } else {
      const newList = produce(MDProject.menuCheckedList, (drafState) => {
        const index = drafState.findIndex((item) => isEqual(params, item));
        drafState.splice(index, 1);
      });
      NModel.dispatch(
        new NMDProject.ARSetState({
          menuCheckedList: newList,
        })
      );
    }
    return MDProject.menuCheckedList.some((item) => isEqual(params, item));
  }
  function openEnterSwaggerModal() {
    swaggerModalRef.current.showModal();
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSwagger);
