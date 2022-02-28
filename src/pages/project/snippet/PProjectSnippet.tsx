import NModel from "@/common/namespace/NModel";
import {
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  Menu,
  message,
  Modal,
  Row,
  Select,
  Space,
  Switch,
} from "antd";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { connect, ConnectRC, NMDGlobal, NMDProject } from "umi";
import SelfStyle from "./LProjectSnippet.less";
import SProject from "../SProject";
import qs from "qs";
import NProject from "../NProject";
import CreateSnipeetModal, {
  ICreateSnipeetModal,
} from "./components/CreateSnipeetModal";
import NProjectSnippet from "./NProjectSnippet";
import SyntaxHighlighter from "react-syntax-highlighter";
import produce from "immer";
import UCopy from "@/common/utils/UCopy";
import DirectoryModal, {
  IDirectoryModal,
} from "@/common/components/directory/combination/modal/DirectoryModal";
import { NSystem } from "@/common/namespace/NSystem";
import { CopyOutlined } from "@ant-design/icons";
import { isEmpty, uniqueId } from "lodash";
export interface IPProjectSnippetProps {
  MDProject: NMDProject.IState;
  MDGlobal: NMDGlobal.IState;
}

const PProjectSnippet: ConnectRC<IPProjectSnippetProps> = (props) => {
  const { MDProject } = props;
  const {
    project: { snippetList },
  } = MDProject;
  const createSnipeetModalRef = useRef<ICreateSnipeetModal>();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [snippetConfig, setSnippetConfig] =
    useState<NProjectSnippet.IConfig>(null);
  const [snippet, setSnippet] = useState<NProjectSnippet>(null);
  const directoryModalRef = useRef<IDirectoryModal>();
  useEffect(() => {
    NModel.dispatch(
      new NMDGlobal.ARChangeSetting({
        controlLayout: false,
      })
    );
    pageSetup();
  }, []);
  const urlQuery = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  }) as {} as NProject.IUrlQuery;
  const [globalform] = Form.useForm();

  return (
    <div className={SelfStyle.main}>
      <DirectoryModal
        onOk={onSelectDirectory}
        ref={directoryModalRef}
      ></DirectoryModal>
      <CreateSnipeetModal
        ref={createSnipeetModalRef}
        onOk={pageSetup}
      ></CreateSnipeetModal>
      <div className={SelfStyle.ableWrap}>
        <Button onClick={onShowCreateSnipeetModal}>添加片段</Button>
        <h1>{MDProject.project.name}</h1>
      </div>
      <div className={SelfStyle.contentWrap}>
        <div className="menuWrap">
          <Menu mode="inline" theme="light" selectedKeys={selectedKeys}>
            {snippetList.map((snippet) => {
              return (
                <Menu.Item
                  key={snippet.script}
                  onClick={() => {
                    setSelectedKeys([snippet.script]);
                    reqGetSnippetConfig(snippet, true);
                  }}
                >
                  {snippet.name}
                  <span className="script">
                    <CopyOutlined
                      onClick={() => UCopy.copyStr(snippet.script)}
                    ></CopyOutlined>
                    {snippet.script}
                  </span>
                </Menu.Item>
              );
            })}
          </Menu>
        </div>
        <div className="scriptWrap">
          {snippetConfig && (
            <>
              <div className="ableWrap">
                <Space size={40}>
                  {snippetConfig.writeOs.open && (
                    <Button
                      onClick={() => onWriteOs(snippetConfig)}
                      type="primary"
                      style={{ width: 120 }}
                    >
                      写入
                    </Button>
                  )}
                </Space>
              </div>

              <div className="globalParamList">
                <div className="title">全局参数</div>
                <Form
                  key={Math.random()}
                  form={globalform}
                  name="basic"
                  layout="horizontal"
                  autoComplete="off"
                  initialValues={getGlobalInitialValues()}
                >
                  {snippetConfig.writeOs.usePathChoose && (
                    <Row gutter={8}>
                      <Col span={12}>
                        <Form.Item
                          name="writeOsPath"
                          label="写入路径"
                          rules={[{ required: true }]}
                        >
                          <Input readOnly></Input>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Button
                          onClick={() => onChooseWritePath(snippetConfig)}
                        >
                          选择路径
                        </Button>
                      </Col>
                    </Row>
                  )}

                  {renderParamList(snippetConfig.globalParamList || [])}
                </Form>
              </div>
              <div className="fragmentListWrap">
                {renderFragmentList(snippetConfig.fragmentList || [])}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
  function onChooseWritePath(snippetConfig: NProjectSnippet.IConfig) {
    directoryModalRef.current.showModal({
      startPath: MDProject.project.rootPath + snippetConfig.writeOs.basePath,
      disableFile: true,
      selectCallbackFlag: "setWriteOsPath",
    });
  }
  function onWriteOs(snippetConfig: NProjectSnippet.IConfig) {
    globalform.validateFields().then(async () => {
      if (
        snippetConfig.writeOs.needFolder &&
        !snippetConfig.writeOs.usePathChoose
      ) {
        directoryModalRef.current.showModal({
          startPath:
            MDProject.project.rootPath + snippetConfig.writeOs.basePath,
          disableFile: true,
          selectCallbackFlag: "writeOs",
        });
      } else {
        reqWriteSnippetOs();
      }
    });
  }
  async function onSelectDirectory(
    pathInfos: NSystem.IDirectory,
    selectCallbackFlag: string
  ) {
    if (selectCallbackFlag == "writeOs") {
      reqWriteSnippetOs(pathInfos.path);
    } else if (selectCallbackFlag === "setWriteOsPath") {
      globalform.setFieldsValue({
        writeOsPath: pathInfos.path,
      });
    }
  }
  function reqWriteSnippetOs(writeOsPath?: string) {
    globalform.validateFields().then(async (values) => {
      const rsp = await SProject.writeSnippetOs(
        {
          id: urlQuery.id,
          script: snippet.script,
        },
        {
          ...values,
          writeOsPath,
        }
      );
      if (rsp.success) {
        Modal.info({
          icon: null,
          content: rsp.list.map((item, index) => (
            <div key={index} className={SelfStyle.writeOsResult}>
              <div className="title">{item.title}</div>
              {item.success ? (
                <div className="success">成功</div>
              ) : (
                <div className="fail">{item.errorMsg}</div>
              )}
            </div>
          )),
        });
      }
    });
  }
  function renderFragmentList(fragmentList: NProjectSnippet.IFragment[]) {
    return fragmentList.map((fragment, index) => {
      return (
        <div className="fragmentWrap" key={index}>
          <div className="titleWrap">
            <div className="title">{fragment.title}</div>
            <div className="btnWrap">
              <Space size={30}>
                {!fragment.noTemplate && (
                  <Button
                    size="small"
                    onClick={() => reqGetPreivewTemplate(index)}
                  >
                    预览
                  </Button>
                )}
              </Space>
            </div>
          </div>
          <div className="previewWrap">
            {fragment.template && (
              <SyntaxHighlighter>{fragment.template}</SyntaxHighlighter>
            )}
            {fragment.template === "" && "无内容"}
          </div>
        </div>
      );
    });
  }
  async function reqGetPreivewTemplate(index: number) {
    globalform.validateFields().then(async (values) => {
      const rsp = await SProject.getPreivewTemplate(
        {
          id: urlQuery.id,
          script: snippet.script,
          index,
        },
        values
      );
      if (rsp.success) {
        setSnippetConfig(
          produce(snippetConfig, (drafState) => {
            drafState.fragmentList[index].template = isEmpty(rsp.data)
              ? ""
              : rsp.data;
          })
        );
        if (!isEmpty(rsp.data)) {
          UCopy.copyStr(rsp.data);
        }
      }
    });
  }
  function renderParamList(paramList: NProjectSnippet.IParam[]) {
    return paramList.map((param, index) => {
      let content: ReactNode = "";
      let onChange;

      if (param.openChangeRequest) {
        onChange = onRequestConfig;
      } else if (param.require && param.name !== "_uniqueId") {
        onChange = changeUniqueId;
      } else {
        onChange = () => {};
      }

      if (param.type === "input") {
        content = (
          <Input
            style={param.style}
            onChange={onChange}
            disabled={param.disabled}
          />
        );
      } else if (param.type === "number") {
        content = (
          <InputNumber
            style={param.style}
            onChange={onChange}
            disabled={param.disabled}
          />
        );
      } else if (param.type === "switch") {
        content = <Switch onChange={onChange}></Switch>;
      } else if (param.type === "select") {
        content = (
          <Select
            showSearch
            style={param.style}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            optionFilterProp="children"
            onChange={onChange}
          >
            {param.valueList.map((item) => (
              <Select.Option key={item} value={item}>
                {item}
              </Select.Option>
            ))}
          </Select>
        );
      }
      return (
        <Form.Item
          key={param.name}
          label={param.label}
          name={param.name}
          valuePropName={param.type === "switch" ? "checked" : "value"}
          rules={[{ required: param.require }]}
        >
          {content}
        </Form.Item>
      );
    });
  }
  function getGlobalInitialValues() {
    const values = snippetConfig.globalParamList.reduce((pre, cur) => {
      pre[cur.name] = cur.defaultValue;
      return pre;
    }, {} as any);
    return values;
  }
  function changeUniqueId() {
    globalform.setFieldsValue({
      _uniqueId: uniqueId(),
    });
  }
  function onRequestConfig() {
    changeUniqueId();
    reqGetSnippetConfig(snippet, false, globalform.getFieldsValue());
  }
  async function reqGetSnippetConfig(
    snippet: NProjectSnippet,
    isChangeScript: boolean,
    values: any = {}
  ) {
    setSnippet(snippet);
    props.history.replace({
      search: qs.stringify({
        id: urlQuery.id,
        script: snippet.script,
      }),
    });
    const rsp = await SProject.getSnippetConfig(
      {
        id: urlQuery.id,
        script: snippet.script,
      },
      values
    );
    if (rsp.success) {
      rsp.data.globalParamList.find((item) => {
        if (item.name === "_uniqueId") {
          item.type = "input";
          item.label = "标识符";
          item.defaultValue = uniqueId();
          item.style = {
            width: 135,
          };
          return true;
        }
        let inputWidth = item.type === "input" ? 300 : 100;
        if (item.style) {
          if (!item.style.width) {
            item.style.width = inputWidth;
          }
        } else {
          item.style = {
            width: inputWidth,
          };
        }
      });
      setSnippetConfig(rsp.data);

      setTimeout(() => {
        const input = document.getElementById("firstGlobalParamInputId");
        if (input) {
          input.focus();
        }
        if (isChangeScript) {
          globalform.resetFields();
        }
      }, 100);
    }
  }

  function onShowCreateSnipeetModal() {
    createSnipeetModalRef.current.showModal(MDProject.project);
  }
  async function pageSetup() {
    const projectRsp = await SProject.getProject(urlQuery.id);
    if (projectRsp.success) {
      NModel.dispatch(
        new NMDProject.ARSetState({
          project: projectRsp.data,
        })
      );
      const { snippetList } = projectRsp.data;

      const currentSnippet = snippetList.find(
        (item) => item.script == urlQuery.script
      );
      if (currentSnippet) {
        reqGetSnippetConfig(currentSnippet, false);
        setSelectedKeys([currentSnippet.script]);
      }
      document.title = "代码片段 - " + projectRsp.data.name;
    }
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSnippet);
