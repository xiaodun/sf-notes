import NModel from '@/common/namespace/NModel';
import {
  Alert,
  Button,
  Checkbox,
  Dropdown,
  Input,
  Menu,
  message,
  Space,
  Table,
  TableProps,
  Tabs,
  Tag,
  Select,
  Radio,
} from 'antd';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { connect, ConnectRC, NMDGlobal, NMDProject } from 'umi';
import SelfStyle from './LProjectSwagger.less';
import SProject from '../SProject';
import EnterSwaggerModal, {
  IEnterSwaggerModal,
} from './components/EnterSwaggerModal';
import NProject from '../NProject';
import {
  CloseOutlined,
  CopyOutlined,
  DownloadOutlined,
  ReloadOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import UCopy from '@/common/utils/UCopy';
import { isEqual } from 'lodash';
import { produce } from 'immer';
import GenerateAjaxCodeModal, {
  IGenerateAjaxCodeModal,
} from './components/GenerateAjaxCodeModal';
import GenerateEnumCodeModal, {
  IGenerateEnumCodeModal,
} from './components/GenerateEnumCodeModal';
import KeyValueExtractionModal, {
  IKeyValueExtractionModal,
} from './components/KeyValueExtractionModal';
import { UModal } from '@/common/utils/modal/UModal';
import SBase from '@/common/service/SBase';
import USwagger from '@/common/utils/USwagger';

export interface IPProjectSwaggerProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

/** 接近 TS 的类型字面量，用于侧栏「复制」 */
function tsLikeTypeFromRecord(r: NProject.IRenderFormatInfo): string {
  if (r.enum?.length) {
    return r.enum.join(' | ');
  }
  if (r.type === 'array') {
    if (r.itemsType) {
      return `${r.itemsType}[]`;
    }
    return 'unknown[]';
  }
  if (r.format && r.type) {
    return `${r.type}(${r.format})`;
  }
  return r.type ? String(r.type) : 'unknown';
}

function formatFieldLineTs(
  r: NProject.IRenderFormatInfo,
  indent: string,
  forResponse: boolean,
): string[] {
  const desc = (r.description || '')
    .replace(/\r?\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const comment = desc ? ` // ${desc}` : '';
  const optional = forResponse ? r.required === false : r.required !== true;
  const opt = optional ? '?' : '';

  if (r.type === 'array' && r.children?.length) {
    const inner = r.children.flatMap((c) =>
      formatFieldLineTs(c, indent + '  ', forResponse),
    );
    return [
      `${indent}${r.name}${opt}: Array<{`,
      ...inner,
      `${indent}>;${comment}`,
    ];
  }

  if (r.children?.length && (r.type === 'object' || !r.type)) {
    const inner = r.children.flatMap((c) =>
      formatFieldLineTs(c, indent + '  ', forResponse),
    );
    return [`${indent}${r.name}${opt}: {`, ...inner, `${indent}};${comment}`];
  }

  const typ = tsLikeTypeFromRecord(r);
  return [`${indent}${r.name}${opt}: ${typ};${comment}`];
}

function formatRequestParamsUsage(m: NProject.IRenderMethodInfo): string {
  const p = m.parameters;
  if (!p?.length) {
    return '{}';
  }
  const inner = p.flatMap((row) => formatFieldLineTs(row, '  ', false));
  return `{\n${inner.join('\n')}\n}`;
}

function formatResponseUsage(m: NProject.IRenderMethodInfo): string {
  const roots = m.responses;
  if (!roots?.length) {
    return '（无）';
  }
  const root = roots[0];

  if (root.type === 'array') {
    if (root.children?.length) {
      const inner = root.children.flatMap((row) =>
        formatFieldLineTs(row, '  ', true),
      );
      return `Array<{\n${inner.join('\n')}\n}>`;
    }
    const it = root.itemsType || 'unknown';
    return `${it}[]`;
  }

  if (root.children?.length) {
    const inner = root.children.flatMap((row) =>
      formatFieldLineTs(row, '  ', true),
    );
    return `{\n${inner.join('\n')}\n}`;
  }

  return tsLikeTypeFromRecord(root) || '（无）';
}

function buildSwaggerApiFieldsDocText(m: NProject.IRenderMethodInfo): string {
  const lines: string[] = [];
  lines.push(`${(m.method || 'get').toUpperCase()} ${m.pathUrl}`);
  if (m.summary?.trim()) {
    lines.push(`接口说明：${m.summary.trim()}`);
  }
  lines.push('');
  lines.push('【请求参数】');
  lines.push(formatRequestParamsUsage(m));
  lines.push('');
  lines.push('【返回格式】');
  lines.push(formatResponseUsage(m));
  return lines.join('\n');
}

const PProjectSwagger: ConnectRC<IPProjectSwaggerProps> = (props) => {
  const { MDProject } = props;
  const swaggerModalRef = useRef<IEnterSwaggerModal>();
  const apiDocWrapRef = useRef<HTMLDivElement>();
  const generateAjaxCodeRef = useRef<IGenerateAjaxCodeModal>();
  const generateEnumCodeRef = useRef<IGenerateEnumCodeModal>();
  const keyValueExtractionRef = useRef<IKeyValueExtractionModal>();
  const [rendMethodInfos, setRenderMethodInfos] =
    useState<NProject.IRenderMethodInfo>(null);
  const [lastRendMethodInfos, setLastRenderMethodInfos] =
    useState<NProject.IRenderMethodInfo>(null);

  const [currentMenuCheckbox, setCurrentMenuCheckbox] =
    useState<NProject.IMenuCheckbox>(null);
  const [menuActiveTabKey, setMenuActiveTabKey] =
    useState<string>('domain');
  const [myAttentionChecked, setMyAttentionChecked] =
    useState<boolean>(false);
  const [searchSwaggerValue, setSearchSwaggerValue] =
    useState<string>('');
  const [projectList, setProjectList] = useState<NProject[]>([]);
  const [currentDefaultProject, changeCurrentDefaultProject] =
    useState<NProject>();

  const [
    checkedAttentionGroupNameList,
    setCheckedAttentionGroupNameList,
  ] = useState<string[]>([]);
  useEffect(() => {
    reqGetProject();
    reqGetApiPrefix();
    reqGetSwagger();
    reqGetAttentionList(true);
    reqGetProjectList();
    SProject.getInExcludeGroups();
    setTimeout(() => {
      document.title = 'Swagger文档';
    }, 1000);
  }, []);
  const desColumnWidth = 450;
  const swaggerTableProps: TableProps<any> = {
    size: 'small',
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
        title: '名称',
        dataIndex: 'name',
        key: 'name',
        render: (text: any, record: NProject.IRenderFormatInfo) => {
          return (
            <span onClick={(e) => UCopy.copyStr(text)}>
              {record.required && (
                <span
                  style={{ color: '#ca3e47', fontWeight: 'bold' }}
                >
                  *&nbsp;
                </span>
              )}
              {text}
            </span>
          );
        },
      },
      {
        title: '描述',
        width: desColumnWidth,
        key: 'description',
        render: (text: any, record: NProject.IRenderFormatInfo) => {
          let node: ReactNode = (
            <div
              onClick={() => {
                UCopy.copyStr(record.description);
              }}
            >
              {record.description}
            </div>
          );
          if (record.enum) {
            node = (
              <>
                <div
                  onClick={() => {
                    UCopy.copyStr(record.description);
                  }}
                >
                  {record.description}
                </div>
                {MDProject.config.showEnumList && (
                  <div
                    onClick={() => {
                      UCopy.copyStr(record.enum.join(' '));
                    }}
                  >
                    枚举:
                    {record.enum.map((item, index) => {
                      return (
                        <span key={index}>
                          {item}
                          {index !== record.enum.length - 1 && (
                            <span
                              style={{
                                color: '#a64942',
                                padding: '0 4px',
                              }}
                            >
                              |
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </>
            );
          }
          return (
            <div
              style={{ width: desColumnWidth, wordBreak: 'keep-all' }}
            >
              {node ? (
                node
              ) : (
                <span style={{ color: '#5bd1d7' }}>没有描述</span>
              )}
            </div>
          );
        },
      },
      {
        title: '类型',
        key: 'type',
        render: (text: any, record: NProject.IRenderFormatInfo) => {
          if (record.type == 'array') {
            let node;
            if (record.itemsType) {
              node = `Array<${record.itemsType}> `;
            } else {
              node = 'Array';
            }
            return <span style={{ color: '#ff502f' }}>{node}</span>;
          } else if (record.enum?.length > 0) {
            return <span style={{ color: '#F78D3F' }}>enum</span>;
          } else if (record.format) {
            return record.format;
          }

          return record.type;
        },
      },
    ],
  };
  return (
    <>
      <EnterSwaggerModal
        ref={swaggerModalRef}
        onOk={() => {
          reqGetSwagger();
          reqGetAttentionList(false);
          SProject.getInExcludeGroups();
          SProject.getConfig();
        }}
      ></EnterSwaggerModal>
      <GenerateAjaxCodeModal
        projectName={currentDefaultProject?.name}
        ref={generateAjaxCodeRef}
      ></GenerateAjaxCodeModal>
      <GenerateEnumCodeModal
        ref={generateEnumCodeRef}
      ></GenerateEnumCodeModal>
      <KeyValueExtractionModal
        onEnumCode={onEnumCode}
        ref={keyValueExtractionRef}
      ></KeyValueExtractionModal>
      <div className={SelfStyle.main}>
        <div className={SelfStyle.optionWrap}>
          <Space direction="horizontal" size={20}>
            <Button onClick={openEnterSwaggerModal}>录入</Button>
            <Dropdown.Button
              menu={{
                items: [
                  {
                    key: 'attention',
                    label: '关注',
                    onClick: onBatchPathAttention
                  },
                  ...(projectList.length ? [{
                    key: 'createAjaxCode',
                    label: '生成ajax代码',
                    onClick: onBatchCreateAjaxCode
                  }] : []),
                  ...(projectList.length ? [{
                    key: 'createMockFile',
                    label: '生成mock文件',
                    onClick: () => onGenerateMockFile(true)
                  }] : []),
                  {
                    key: 'cancelAttention',
                    label: '取消关注',
                    onClick: onBatchCancelPathAttention
                  },
                  {
                    key: 'cancelMenuChecked',
                    label: '取消选中',
                    onClick: onCancelMenuChecked
                  }
                ]
              }}
            >
              批量操作
            </Dropdown.Button>
            <Input.Search
              allowClear
              style={{ width: 280 }}
              onPressEnter={(e) =>
                onSearchSwagger(e.currentTarget.value.trim())
              }
              onSearch={(value) => onSearchSwagger(value.trim())}
              enterButton
            />
            <Button onClick={showKeyValueExtractionModal}>
              {' '}
              键值提取
            </Button>
            <Radio.Group
              value={MDProject.config.swaggerPathShowWay}
              onChange={(e) =>
                onChangeConfig({ swaggerPathShowWay: e.target.value })
              }
            >
              <Radio.Button value="path">路径</Radio.Button>
              <Radio.Button value="desc">描述</Radio.Button>
            </Radio.Group>
          </Space>
        </div>
        <div className={SelfStyle.contentWrap}>
          <div className={SelfStyle.apiMenu}>{getApiMenu()}</div>

          {renderSwaggerUI()}
        </div>
      </div>
    </>
  );
  function getApiMenu() {
    return (
      <>
        <Tabs activeKey={menuActiveTabKey} onChange={onMenuTabChange}>
          <Tabs.TabPane key="domain" tab="域名">
            <Menu
              defaultOpenKeys={['myDomainSearch']}
              mode="inline"
              theme="light"
            >
              {searchSwaggerValue ? (
                <Menu.SubMenu
                  key="myDomainSearch"
                  title={
                    <>
                      <span onClick={(e) => onStop(e)}>
                        <Checkbox
                          checked={myAttentionChecked}
                          onChange={(e) =>
                            onMenuMySearchCheckedChange(
                              e.target.checked,
                            )
                          }
                        ></Checkbox>
                      </span>
                      我的搜索
                    </>
                  }
                >
                  {filterSwaggerList().map((pathInfos) => {
                    return renderMenuPathUrl(
                      pathInfos,
                      pathInfos.data,
                    );
                  })}
                </Menu.SubMenu>
              ) : (
                MDProject.domainSwaggerList.map((domainItem) => {
                  return (
                    <Menu.SubMenu
                      key={domainItem.id}
                      title={
                        <div className="domainTitleWrap">
                          <div className="title">
                            {domainItem.domain}
                          </div>
                          <div className="able">
                            <Space direction="horizontal" size={8}>
                              <Button
                                onClick={(e) => onReload(domainItem)}
                                shape="circle"
                                size="small"
                                icon={<ReloadOutlined />}
                              ></Button>
                              <Button
                                onClick={(e) =>
                                  onDelDomain(e, domainItem)
                                }
                                shape="circle"
                                size="small"
                                icon={<CloseOutlined />}
                              ></Button>
                            </Space>
                          </div>
                        </div>
                      }
                    >
                      {Object.values(domainItem.data).map(
                        (groupItem) => {
                          const groupMenuCheckbox: NProject.IMenuCheckbox = {
                            domain: domainItem.domain,
                            groupName: groupItem.groupName,
                            isGroup: true,
                          };
                          return (
                            <Menu.SubMenu
                              key={
                                domainItem.domain +
                                groupItem.groupName
                              }
                              title={
                                <>
                                  <span onClick={(e) => onStop(e)}>
                                    <Checkbox
                                      checked={getMenuChecked(
                                        groupMenuCheckbox,
                                      )}
                                      onChange={(e) =>
                                        onMenuDomainCheckedChange(
                                          e.target.checked,
                                          groupMenuCheckbox,
                                        )
                                      }
                                      className={SelfStyle.tagCheckbox}
                                    />
                                  </span>
                                  {groupItem.groupName}
                                </>
                              }
                            >
                              {Object.values(groupItem.tags).map(
                                (tagItem, tagIndex) => {
                                  const tagMenuCheckbox: NProject.IMenuCheckbox =
                                    {
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
                                          <span
                                            onClick={(e) => onStop(e)}
                                          >
                                            <Checkbox
                                              checked={getMenuChecked(
                                                tagMenuCheckbox,
                                              )}
                                              onChange={(e) =>
                                                onMenuDomainCheckedChange(
                                                  e.target.checked,
                                                  tagMenuCheckbox,
                                                )
                                              }
                                              className={
                                                SelfStyle.tagCheckbox
                                              }
                                            ></Checkbox>
                                          </span>
                                          {tagItem.tagName}
                                        </>
                                      }
                                    >
                                      {Object.entries(
                                        tagItem.paths,
                                      ).map(([pathKey, pathItem]) => {
                                        const pathMenuCheckbox = {
                                          domain: domainItem.domain,
                                          groupName:
                                            groupItem.groupName,
                                          tagName: tagItem.tagName,
                                          pathKey,
                                          pathUrl: pathItem.pathUrl,
                                          method: pathItem.method,
                                          data: pathItem,
                                          isPath: true,
                                        };
                                        return renderMenuPathUrl(
                                          pathMenuCheckbox,
                                          pathItem,
                                        );
                                      })}
                                    </Menu.SubMenu>
                                  );
                                },
                              )}
                            </Menu.SubMenu>
                          );
                        },
                      )}
                    </Menu.SubMenu>
                  );
                })
              )}
            </Menu>
          </Tabs.TabPane>
          <Tabs.TabPane key="attentionList" tab="关注">
            <Menu
              mode="inline"
              defaultOpenKeys={['myAttention']}
              theme="light"
            >
              <Menu.SubMenu
                key="myAttention"
                title={
                  <>
                    <span onClick={(e) => onStop(e)}>
                      <Checkbox
                        checked={myAttentionChecked}
                        onChange={(e) =>
                          onMenuAttentionCheckedChange(
                            e.target.checked,
                          )
                        }
                      ></Checkbox>
                    </span>
                    我的关注
                  </>
                }
              >
                {!MDProject.attentionInfos.hasMoreTag ||
                searchSwaggerValue
                  ? filterAttentionPathList().map((pathInfos) => {
                      return renderMenuPathUrl(
                        pathInfos,
                        pathInfos.data,
                      );
                    })
                  : Object.keys(
                      MDProject.attentionInfos.tagInfos,
                    ).map((groupName, index) => (
                      <Menu.SubMenu
                        key={index}
                        title={
                          <>
                            <span onClick={(e) => onStop(e)}>
                              <Checkbox
                                checked={getGroupNameChecked(
                                  groupName,
                                )}
                                onChange={(e) =>
                                  onGroupNameAttentionCheckedChange(
                                    e.target.checked,
                                    groupName,
                                  )
                                }
                              ></Checkbox>
                            </span>
                            {groupName}
                          </>
                        }
                      >
                        {MDProject.attentionInfos.tagInfos[
                          groupName
                        ].map((pathInfos) => {
                          return renderMenuPathUrl(
                            pathInfos,
                            pathInfos.data,
                          );
                        })}
                      </Menu.SubMenu>
                    ))}
              </Menu.SubMenu>
            </Menu>
          </Tabs.TabPane>
        </Tabs>
      </>
    );
  }
  function onChangeConfig(config: Partial<NProject.IConfig>) {
    SProject.updateConfig(config);
  }
  function renderSwaggerUI() {
    let contentNode: ReactNode = null;
    if (rendMethodInfos) {
      contentNode = (
        <div ref={apiDocWrapRef} className={SelfStyle.apiDoc}>
          <div className={SelfStyle.ableWrap}>
            <div className="left-wrap">
              {projectList.length ? (
                <Select
                  value={currentDefaultProject?.id}
                  style={{ width: 250 }}
                  onChange={onChangeDefaultProject}
                >
                  {projectList.map((item, index) => (
                    <Select.Option value={item.id} key={index}>
                      {item.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                ''
              )}
            </div>
            <div className="right-wrap">
              {menuActiveTabKey === 'attentionList' ? (
                <Button
                  type="default"
                  onClick={onCancelAttentionPath}
                >
                  取消关注
                </Button>
              ) : (
                <Button type="default" onClick={onAttentionPath}>
                  关注
                </Button>
              )}

              {projectList.length && (
                <>
                  <Button type="default" onClick={onGenerateAjaxCode}>
                    生成ajax代码
                  </Button>
                  <Button
                    type="default"
                    onClick={() => onGenerateMockFile()}
                  >
                    生成mock文件
                  </Button>
                </>
              )}
              <Button type="default" onClick={onCopyApiFieldsDoc}>
                复制
              </Button>
            </div>
          </div>
          <div className={SelfStyle.baseInfo}>
            <div className={SelfStyle.itemWrap}>
              <div className="label">前缀</div>
              <div className="content">
                {renderApiPrefix(currentMenuCheckbox.pathUrl)}
              </div>
            </div>
            <div className={SelfStyle.itemWrap}>
              <div className="label">路径</div>
              <div className="content">
                {currentMenuCheckbox.pathUrl}
                <Button
                  type="link"
                  onClick={() =>
                    onCopyPathUrl(currentMenuCheckbox.pathUrl, false)
                  }
                >
                  复制
                </Button>
                {getPrefixByPathUrl(currentMenuCheckbox) && (
                  <Button
                    type="link"
                    onClick={() =>
                      onCopyPathUrl(currentMenuCheckbox.pathUrl, true)
                    }
                  >
                    带前缀复制
                  </Button>
                )}
              </div>
            </div>
            <div className={SelfStyle.itemWrap}>
              <div className="label">描述</div>
              <div className="content summary">
                {rendMethodInfos.summary}
              </div>
            </div>
            {(menuActiveTabKey === 'attentionList' ||
              searchSwaggerValue) && (
              <>
                <div className={SelfStyle.itemWrap}>
                  <div className="label">域名</div>
                  <div className="content">
                    {currentMenuCheckbox.domain}
                  </div>
                </div>
                <div className={SelfStyle.itemWrap}>
                  <div className="label">分组</div>
                  <div className="content">
                    {currentMenuCheckbox.groupName}
                  </div>
                </div>
                <div className={SelfStyle.itemWrap}>
                  <div className="label">标签</div>
                  <div className="content">
                    {currentMenuCheckbox.tagName}
                  </div>
                </div>
              </>
            )}
          </div>
          {rendMethodInfos.notFound ? (
            <div className="not-found">没有匹配到接口数据格式</div>
          ) : (
            <>
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
                          className="default-copy"
                          type="primary"
                          shape="round"
                          size="small"
                          onClick={() =>
                            onCopySwaggerData(
                              rendMethodInfos.parameters,
                              false,
                            )
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

              <div
                key={Math.random()}
                className={SelfStyle.responseInfo}
              >
                {getResponseUI()}
              </div>
            </>
          )}
        </div>
      );
    }
    return contentNode;
  }
  function getResponseUI() {
    return rendMethodInfos.responses?.[0]?.type ? (
      <>
        <div className={SelfStyle.title}>
          <div className="desc">
            <DownloadOutlined />
            返回格式
          </div>
          <div className="able-wrap">
            <Space direction="horizontal" size={20}>
              <Dropdown.Button
                size="small"
                menu={{
                  items: [
                    ...(projectList.length ? [{
                      key: 'byProject',
                      label: '按项目',
                      onClick: () => onCopySwaggerDataByProject(
                        rendMethodInfos.responses,
                        true,
                      )
                    }] : []),
                    {
                      key: 'autoFill',
                      label: '自动填充',
                      onClick: () => onCopySwaggerData(
                        rendMethodInfos.responses,
                        true,
                      )
                    }
                  ]
                }}
              >
                <span
                  onClick={() =>
                    onCopySwaggerData(
                      rendMethodInfos.responses,
                      false,
                    )
                  }
                >
                  复制
                </span>
              </Dropdown.Button>
            </Space>
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
  function getSiblingPathMethodPairs(
    domain: string,
    groupName: string,
    tagName: string,
  ): USwagger.IPathMethodPair[] {
    const domainSwagger = MDProject.domainSwaggerList.find(
      (d) => d.domain === domain,
    );
    const paths =
      domainSwagger?.data?.[groupName]?.tags?.[tagName]?.paths;
    if (!paths) {
      return [];
    }
    return Object.values(paths)
      .filter((p) => p && typeof p.pathUrl === 'string' && p.pathUrl.length > 0)
      .map((p) => ({
        pathUrl: p.pathUrl,
        method: p.method || 'get',
      }));
  }
  function renderMenuPathUrl(
    pathMenuCheckbox: NProject.IMenuCheckbox,
    pathItem: NProject.IRenderMethodInfo,
  ) {
    const pathUrlForLabel =
      pathItem.pathUrl ||
      pathMenuCheckbox.pathUrl ||
      USwagger.parsePathOperationKey(pathMenuCheckbox.pathKey || '').swaggerPath ||
      '';
    const pathModeLabel =
      MDProject.config.swaggerPathShowWay === 'path'
        ? USwagger.getMenuPathDisplayLabel(
            pathUrlForLabel,
            pathItem.method,
            getSiblingPathMethodPairs(
              pathMenuCheckbox.domain,
              pathMenuCheckbox.groupName,
              pathMenuCheckbox.tagName,
            ),
          )
        : '';
    return (
      <Menu.Item
        onClick={() => {
          onSelectApi(pathItem, pathMenuCheckbox);
        }}
        key={
          pathMenuCheckbox.domain +
          pathMenuCheckbox.groupName +
          pathMenuCheckbox.tagName +
          (pathMenuCheckbox.pathKey || pathMenuCheckbox.pathUrl)
        }
      >
        <Checkbox
          checked={getMenuChecked(pathMenuCheckbox)}
          onChange={(e) =>
            onMenuDomainCheckedChange(
              e.target.checked,
              pathMenuCheckbox,
            )
          }
          className={SelfStyle.pathCheckbox}
        ></Checkbox>
        {pathItem.notFound ? (
          <Tag color="#a39e9e">失效</Tag>
        ) : (
          <span
            className={SelfStyle.methodBadge}
            data-http-method={(pathItem.method || 'get').toLowerCase()}
          >
            {(pathItem.method || 'get').toUpperCase()}
          </span>
        )}
        {MDProject.config.swaggerPathShowWay == 'path'
          ? renderPathUrl(pathModeLabel, pathUrlForLabel || pathItem.pathUrl)
          : pathItem.summary}
      </Menu.Item>
    );
  }
  async function reqGetProject() {
    const rsp = await SProject.getConfig();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          config: rsp.data,
        }),
      );
    }
  }
  function showKeyValueExtractionModal() {
    keyValueExtractionRef.current.showModal();
  }
  function onEnumCode(enumList: string[], values: Object) {
    generateEnumCodeRef.current.showModal(enumList, values);
  }
  function showGenerateAjaxCodeModal(
    checkedPathList: NProject.IMenuCheckbox[],
  ) {
    generateAjaxCodeRef.current.showModal(checkedPathList);
  }
  async function reqGetAttentionList(isFirst: boolean) {
    const rsp = await SProject.getAttentionList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          attentionInfos: rsp.data,
        }),
      );
      if (rsp.data.list.length && isFirst) {
        setMenuActiveTabKey('attentionList');
      }

      if (
        menuActiveTabKey == 'attentionList' &&
        !rsp.data.list.length
      ) {
        setMenuActiveTabKey('domain');
      }
    }
  }
  async function reqGetApiPrefix() {
    const rsp = await SProject.getApiPrefixs();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          apiPrefixs: rsp.data,
        }),
      );
    }
  }
  async function reqGetSwagger() {
    const rsp = await SProject.getSwaggerList();
    if (rsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          domainSwaggerList: rsp.list,
        }),
      );

      const selectMenuCheckbox: NProject.IMenuCheckbox =
        JSON.parse(localStorage.currentSelectApi || null) || {};
      if (selectMenuCheckbox.domain) {
        const domainSwagger = rsp.list.find(
          (item) => item.domain === selectMenuCheckbox.domain,
        );
        const paths =
          domainSwagger?.data?.[selectMenuCheckbox.groupName]?.tags?.[
            selectMenuCheckbox.tagName
          ]?.paths;
        const pathLookupKey =
          selectMenuCheckbox.pathKey ?? selectMenuCheckbox.pathUrl;
        selectMenuCheckbox.data = paths?.[pathLookupKey];
        if (selectMenuCheckbox.data) {
          setCurrentMenuCheckbox(selectMenuCheckbox);
          setRenderMethodInfos(selectMenuCheckbox.data);
        }
      }
    }
  }
  function onSearchSwagger(value: string) {
    setSearchSwaggerValue(value);
  }
  function attentionPathDedupeKey(item: NProject.IMenuCheckbox) {
    const method =
      (item.method ||
        USwagger.parsePathOperationKey(item.pathKey || '').method ||
        '').toLowerCase();
    const pathPart =
      item.pathKey ||
      (item.pathUrl
        ? method
          ? `${method}:${item.pathUrl}`
          : item.pathUrl
        : '');
    return `${item.domain}\x1e${item.groupName}\x1e${item.tagName}\x1e${
      pathPart
    }`;
  }
  function isMenuTagRow(
    a: NProject.IMenuCheckbox,
    b: NProject.IMenuCheckbox,
  ) {
    return (
      a.domain === b.domain &&
      a.groupName === b.groupName &&
      a.tagName === b.tagName &&
      !!a.isTag &&
      !!b.isTag
    );
  }
  function isMenuGroupRow(
    a: NProject.IMenuCheckbox,
    b: NProject.IMenuCheckbox,
  ) {
    return (
      a.domain === b.domain &&
      a.groupName === b.groupName &&
      !!a.isGroup &&
      !!b.isGroup
    );
  }
  function pathImpliedByAncestor(
    pathCb: NProject.IMenuCheckbox,
    list: NProject.IMenuCheckbox[],
  ) {
    const parentTag: NProject.IMenuCheckbox = {
      domain: pathCb.domain!,
      groupName: pathCb.groupName!,
      tagName: pathCb.tagName!,
      isTag: true,
    };
    const parentGroup: NProject.IMenuCheckbox = {
      domain: pathCb.domain!,
      groupName: pathCb.groupName!,
      isGroup: true,
    };
    return list.some(
      (item) =>
        isMenuTagRow(item, parentTag) || isMenuGroupRow(item, parentGroup),
    );
  }
  function tagImpliedByGroup(
    tagCb: NProject.IMenuCheckbox,
    list: NProject.IMenuCheckbox[],
  ) {
    const parentGroup: NProject.IMenuCheckbox = {
      domain: tagCb.domain!,
      groupName: tagCb.groupName!,
      isGroup: true,
    };
    return list.some((item) => isMenuGroupRow(item, parentGroup));
  }
  function getMenuCheckedPathUrlList() {
    const list: NProject.IMenuCheckbox[] = [];
    const seen = new Set<string>();
    const pushPath = (row: NProject.IMenuCheckbox) => {
      const k = attentionPathDedupeKey(row);
      if (seen.has(k)) {
        return;
      }
      seen.add(k);
      list.push(row);
    };

    MDProject.menuCheckedList.forEach((menuCheckedInfos) => {
      if (menuCheckedInfos.isPath) {
        pushPath(menuCheckedInfos);
        return;
      }
      const domainSwagger = MDProject.domainSwaggerList.find(
        (d) => d.domain === menuCheckedInfos.domain,
      );
      if (!domainSwagger?.data?.[menuCheckedInfos.groupName!]?.tags) {
        return;
      }
      if (menuCheckedInfos.isGroup) {
        Object.values(
          domainSwagger.data[menuCheckedInfos.groupName].tags,
        ).forEach((tagItem) => {
          Object.keys(tagItem.paths).forEach((pathKey) => {
            const row = tagItem.paths[pathKey];
            pushPath({
              domain: menuCheckedInfos.domain,
              tagName: tagItem.tagName,
              groupName: menuCheckedInfos.groupName!,
              data: row,
              pathKey,
              pathUrl: row.pathUrl,
              method: row.method,
              isPath: true,
            });
          });
        });
        return;
      }
      if (menuCheckedInfos.isTag && menuCheckedInfos.tagName) {
        const paths =
          domainSwagger.data[menuCheckedInfos.groupName].tags[
            menuCheckedInfos.tagName
          ]?.paths;
        if (!paths) {
          return;
        }
        Object.keys(paths).forEach((pathKey) => {
          const row = paths[pathKey];
          pushPath({
            domain: menuCheckedInfos.domain,
            tagName: menuCheckedInfos.tagName,
            groupName: menuCheckedInfos.groupName,
            data: row,
            pathKey,
            pathUrl: row.pathUrl,
            method: row.method,
            isPath: true,
          });
        });
      }
    });
    return list;
  }
  function onBatchCancelPathAttention() {
    const list = getMenuCheckedPathUrlList();

    if (!list.length) {
      message.warning('请先勾选分组、标签或具体接口');
      return;
    }
    reqCanclePathAttention(list);
    setRenderMethodInfos(null);
  }

  function onBatchCreateAjaxCode() {
    const list = getMenuCheckedPathUrlList();

    if (!list.length) {
      message.warning('请先勾选分组、标签或具体接口');
      return;
    }
    showGenerateAjaxCodeModal(list);
  }
  function onBatchPathAttention() {
    const list = getMenuCheckedPathUrlList();

    if (!list.length) {
      message.warning('请先勾选分组、标签或具体接口');
      return;
    }
    reqSetPathAttention(list);
  }
  function onAttentionPath() {
    reqSetPathAttention([currentMenuCheckbox]);
  }
  function onGenerateAjaxCode() {
    showGenerateAjaxCodeModal([currentMenuCheckbox]);
  }
  async function onGenerateMockFile(isBatch: boolean = false) {
    const menuCheckboxList = isBatch
      ? getMenuCheckedPathUrlList()
      : [currentMenuCheckbox];
    if (isBatch && !menuCheckboxList.length) {
      message.warning('请先勾选分组、标签或具体接口');
      return;
    }
    const pathList = menuCheckboxList.map(
      (item) => getPrefixByPathUrl(item) + item.pathUrl,
    );
    const rsp = await SProject.getProjectSendPath(
      currentDefaultProject.name,
      pathList,
    );
    UModal.showConfirmOperation(rsp.data, {
      title:
        '请检查这些路径,点击执行后它们会被发往sf-mock创建对应的mock文件',
      width: '860px',
      onOk() {
        menuCheckboxList.forEach(async (menuCheckbox, index) => {
          const mockFileData = menuCheckbox.data?.responses?.[0].type
            ? await reqCopySwaggerDataByProject(
                menuCheckbox.data.responses,
                true,
              )
            : '';
          SBase.sendOtherDomainUrl(rsp.data.list[index], {
            mockFileData,
          });
        });
      },
    });
  }
  function onCancelAttentionPath() {
    reqCanclePathAttention([currentMenuCheckbox]);
    setRenderMethodInfos(null);
  }
  async function reqSetPathAttention(list: NProject.IMenuCheckbox[]) {
    const rsp = await SProject.setPathAttention(list);
    if (rsp.success) {
      reqGetAttentionList(false);
      message.success('关注成功');
    }
  }
  async function reqCanclePathAttention(
    list: NProject.IMenuCheckbox[],
  ) {
    const rsp = await SProject.cancelPathAttention(list);
    if (rsp.success) {
      reqGetAttentionList(false);
    }
  }
  function onCopyApiFieldsDoc() {
    if (!rendMethodInfos || rendMethodInfos.notFound) {
      message.warning('请先选择一个接口');
      return;
    }
    const text = buildSwaggerApiFieldsDocText(rendMethodInfos);
    UCopy.copyStr(text);
  }
  function onCopyPathUrl(pathUrl: string, withPrefix: boolean) {
    let content = pathUrl;
    if (withPrefix) {
      content = getPrefixByPathUrl(currentMenuCheckbox) + pathUrl;
    }
    UCopy.copyStr(content);
  }

  async function onCopySwaggerDataByProject(
    rspItemList: NProject.IRenderFormatInfo[],
    isRsp: boolean,
  ) {
    const data = await reqCopySwaggerDataByProject(
      rspItemList,
      isRsp,
    );

    UCopy.copyStr(JSON.stringify(data, null, 2));
  }
  async function reqCopySwaggerDataByProject(
    rspItemList: NProject.IRenderFormatInfo[],
    isRsp: boolean,
  ) {
    let project = projectList.find(
      (project) => project.id == currentDefaultProject.id,
    );
    const rsp = await SProject.copySwaggerDataWithProject({
      rspItemList,
      name: project.name,
      isRsp,
    });

    return rsp.data;
  }
  async function onChangeDefaultProject(id: number) {
    let project = projectList.find((project) => project.id == id);
    changeCurrentDefaultProject(project);
    await SProject.setDefaultProject(project.id);
  }
  async function onCopySwaggerData(
    rspItemList: NProject.IRenderFormatInfo[],
    isRsp: boolean,
  ) {
    const rsp = await SProject.copySwaggerData({
      rspItemList,
      isRsp,
    });

    if (rsp.success) {
      UCopy.copyStr(JSON.stringify(rsp.data, null, 2));
    }
  }
  async function reqGetProjectList() {
    const rsp = await SProject.getProjectList();
    if (rsp.success) {
      setProjectList(rsp.list);
      let defaultProject = rsp.list.find(
        (project) => project.isDefault,
      );
      if (defaultProject) {
        changeCurrentDefaultProject(defaultProject);
      } else {
        if (rsp.list.length) {
          changeCurrentDefaultProject(rsp.list[0]);
        }
      }
    }
  }
  function getPrefixByPathUrl(menuCheckbox: NProject.IMenuCheckbox) {
    let prefix: string = '';
    if (MDProject.apiPrefixs) {
      const matchDomian = Object.keys(MDProject.apiPrefixs).find(
        (domian) => {
          const regexp = new RegExp(domian);
          if (regexp.test(menuCheckbox.domain)) {
            return true;
          }
          return false;
        },
      );
      const prefixConfigs =
        MDProject.apiPrefixs[matchDomian]?.[menuCheckbox.groupName];
      if (prefixConfigs) {
        Object.keys(prefixConfigs).find((item) => {
          if (menuCheckbox.pathUrl.startsWith(item)) {
            let config = prefixConfigs[item];
            prefix = config.prefix;
            return true;
          }
          return false;
        });
      }
    }
    return prefix;
  }
  function renderApiPrefix(pathUrl: string) {
    const prefix = getPrefixByPathUrl(currentMenuCheckbox);

    if (prefix == undefined) {
      return <span style={{ color: '#ca3e47' }}>没有配置前缀</span>;
    } else if (prefix == '') {
      return <span style={{ color: '#1ee3cf' }}>没有前缀</span>;
    } else {
      return (
        <span style={{ color: 'rgba(23,34,59,1)' }}>{prefix}</span>
      );
    }
  }
  /** @param displayText 菜单上展示的区分文案；@param copyFullPath 复制到剪贴板的内容，默认用展示文案 */
  function renderPathUrl(displayText: string, copyFullPath?: string) {
    const copyStr = copyFullPath ?? displayText;
    return (
      <>
        <CopyOutlined onClick={() => UCopy.copyStr(copyStr)} />
        <span
          className={SelfStyle.pathValue}
          title={copyFullPath || displayText}
        >
          {displayText}
        </span>
      </>
    );
  }
  function onSelectApi(
    rendMethodInfos: NProject.IRenderMethodInfo,
    pathMenuCheckbox: NProject.IMenuCheckbox,
  ) {
    localStorage.currentSelectApi = JSON.stringify(
      produce(pathMenuCheckbox, (drafData) => {
        drafData.data = null;
      }),
    );
    setRenderMethodInfos(rendMethodInfos);
    setCurrentMenuCheckbox(pathMenuCheckbox);

    if (apiDocWrapRef.current) {
      apiDocWrapRef.current.scrollTop = 0;
    }
  }

  function filterAttentionPathList() {
    return MDProject.attentionInfos.list.filter((item) =>
      JSON.stringify(item).includes(searchSwaggerValue),
    );
  }
  function filterSwaggerList() {
    const list: NProject.IMenuCheckbox[] = [];

    MDProject.domainSwaggerList.forEach((domainItem) => {
      const searchDomainItemStr = JSON.stringify(domainItem);
      if (searchDomainItemStr.includes(searchSwaggerValue)) {
        //搜索域名下

        Object.keys(domainItem.data).forEach((groupName) => {
          const groupValueStr = JSON.stringify(
            domainItem.data[groupName],
          );
          if (groupValueStr.includes(searchSwaggerValue)) {
            //搜索组下面

            Object.keys(domainItem.data[groupName].tags).forEach(
              (tagName) => {
                {
                  const tagValueStr = JSON.stringify(
                    domainItem.data[groupName].tags[tagName],
                  );
                  if (tagValueStr.includes(searchSwaggerValue)) {
                    //搜索标签下面
                    Object.keys(
                      domainItem.data[groupName].tags[tagName].paths,
                    ).forEach((pathKey) => {
                      const pathValueStr = JSON.stringify(
                        domainItem.data[groupName].tags[tagName]
                          .paths[pathKey],
                      );
                      if (pathValueStr.includes(searchSwaggerValue)) {
                        //搜索路径下面
                        const row =
                          domainItem.data[groupName].tags[tagName].paths[
                            pathKey
                          ];
                        list.push({
                          domain: domainItem.domain,
                          groupName,
                          tagName,
                          pathKey,
                          pathUrl: row.pathUrl,
                          method: row.method,
                          isPath: true,
                          data: row,
                        });
                      }
                    });
                  }
                }
              },
            );
          }
        });
      }
    });
    return list;
  }
  function onMenuTabChange(activeKey: string) {
    setMenuActiveTabKey(activeKey);
    setRenderMethodInfos(lastRendMethodInfos);
    setLastRenderMethodInfos(rendMethodInfos);
    onCancelMenuChecked();
  }
  function onCancelMenuChecked() {
    setMyAttentionChecked(false);
    setCheckedAttentionGroupNameList([]);
    NModel.dispatch(
      new NMDProject.ARSetState({
        menuCheckedList: [],
      }),
    );
  }

  function onReload(domainItem: NProject.IDomainSwagger) {
    swaggerModalRef.current.reload(
      domainItem.domain,
      props.MDProject.inExcludeGroups,
    );
  }
  async function onDelDomain(
    event: React.MouseEvent,
    domainItem: NProject.IDomainSwagger,
  ) {
    onStop(event);
    const rsp = await SProject.delSwaggerDomain(domainItem);
    if (rsp.success) {
      message.success('已删除!');
      reqGetSwagger();
      reqGetAttentionList(false);
    }
  }
  function onStop(event: React.MouseEvent) {
    event.stopPropagation();
  }
  function onMenuMySearchCheckedChange(checked: boolean) {
    let list: NProject.IMenuCheckbox[] = [];
    if (checked) {
      list = filterSwaggerList();
    }
    setMyAttentionChecked(checked);
    NModel.dispatch(
      new NMDProject.ARSetState({
        menuCheckedList: list,
      }),
    );
  }
  function onMenuAttentionCheckedChange(checked: boolean) {
    let list: NProject.IMenuCheckbox[] = [];
    if (checked) {
      list = MDProject.attentionInfos.list;
    }
    setMyAttentionChecked(checked);
    NModel.dispatch(
      new NMDProject.ARSetState({
        menuCheckedList: list,
      }),
    );
  }
  function getGroupNameChecked(groupName: string) {
    return checkedAttentionGroupNameList.includes(groupName);
  }
  function onGroupNameAttentionCheckedChange(
    checked: boolean,
    groupName: string,
  ) {
    if (checked) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          menuCheckedList: [
            ...MDProject.menuCheckedList,
            ...MDProject.attentionInfos.tagInfos[groupName].filter(
              (item) =>
                !MDProject.menuCheckedList.some((pathInfos) =>
                  isEqual(item, pathInfos),
                ),
            ),
          ],
        }),
      );
      setCheckedAttentionGroupNameList([
        ...checkedAttentionGroupNameList,
        groupName,
      ]);
    } else {
      const newList = produce(
        MDProject.menuCheckedList,
        (drafState) => {
          MDProject.attentionInfos.tagInfos[groupName].forEach(
            (item) => {
              const index = drafState.findIndex((pathInfos) =>
                isEqual(item, pathInfos),
              );
              drafState.splice(index, 1);
            },
          );
        },
      );

      const index = checkedAttentionGroupNameList.findIndex(
        (item) => item === groupName,
      );
      checkedAttentionGroupNameList.splice(index, 1);
      setCheckedAttentionGroupNameList(
        [...checkedAttentionGroupNameList].splice(index, 1),
      );

      NModel.dispatch(
        new NMDProject.ARSetState({
          menuCheckedList: newList,
        }),
      );
    }
  }
  function getMenuChecked(params: NProject.IMenuCheckbox) {
    const list = MDProject.menuCheckedList;
    if (list.some((item) => isEqual(params, item))) {
      return true;
    }
    if (params.isPath) {
      return pathImpliedByAncestor(params, list);
    }
    if (params.isTag) {
      return tagImpliedByGroup(params, list);
    }
    return false;
  }
  function onMenuDomainCheckedChange(
    checked: boolean,
    params: NProject.IMenuCheckbox,
  ) {
    if (!checked) {
      const directIdx = MDProject.menuCheckedList.findIndex((item) =>
        isEqual(item, params),
      );
      if (directIdx === -1) {
        if (params.isPath) {
          const parentTag: NProject.IMenuCheckbox = {
            domain: params.domain,
            groupName: params.groupName,
            tagName: params.tagName,
            isTag: true,
          };
          const parentGroup: NProject.IMenuCheckbox = {
            domain: params.domain,
            groupName: params.groupName,
            isGroup: true,
          };
          const tagIdx = MDProject.menuCheckedList.findIndex((item) =>
            isMenuTagRow(item, parentTag),
          );
          const groupIdx = MDProject.menuCheckedList.findIndex((item) =>
            isMenuGroupRow(item, parentGroup),
          );
          if (tagIdx !== -1 || groupIdx !== -1) {
            const drop = new Set<number>();
            if (tagIdx >= 0) {
              drop.add(tagIdx);
            }
            if (groupIdx >= 0) {
              drop.add(groupIdx);
            }
            const newList = MDProject.menuCheckedList.filter(
              (_, i) => !drop.has(i),
            );
            NModel.dispatch(
              new NMDProject.ARSetState({
                menuCheckedList: newList,
              }),
            );
            return;
          }
        }
        if (
          params.isTag &&
          tagImpliedByGroup(params, MDProject.menuCheckedList)
        ) {
          const parentGroup: NProject.IMenuCheckbox = {
            domain: params.domain!,
            groupName: params.groupName!,
            isGroup: true,
          };
          const gi = MDProject.menuCheckedList.findIndex((item) =>
            isMenuGroupRow(item, parentGroup),
          );
          if (gi !== -1) {
            const newList = MDProject.menuCheckedList.filter(
              (_, i) => i !== gi,
            );
            NModel.dispatch(
              new NMDProject.ARSetState({
                menuCheckedList: newList,
              }),
            );
            return;
          }
        }
      }
    }
    if (checked) {
      if (!MDProject.menuCheckedList.some((item) => isEqual(item, params))) {
        NModel.dispatch(
          new NMDProject.ARSetState({
            menuCheckedList: [...MDProject.menuCheckedList, params],
          }),
        );
      }
    } else {
      const newList = produce(
        MDProject.menuCheckedList,
        (drafState) => {
          const index = drafState.findIndex((item) =>
            isEqual(params, item),
          );
          if (index !== -1) {
            drafState.splice(index, 1);
          }
        },
      );
      NModel.dispatch(
        new NMDProject.ARSetState({
          menuCheckedList: newList,
        }),
      );
    }
  }
  function openEnterSwaggerModal() {
    swaggerModalRef.current.showModal(
      props.MDProject.domainSwaggerList,
      props.MDProject,
    );
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSwagger);
