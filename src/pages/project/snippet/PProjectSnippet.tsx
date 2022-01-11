import NModel from "@/common/namespace/NModel";
import { Button, Form, Input, Menu, message, Modal, Space, Switch } from "antd";
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

  const [snippetConfig, setSnippetConfig] =
    useState<NProjectSnippet.IConfig>(null);
  const [snippet, setSnippet] = useState<NProjectSnippet>(null);
  const directoryModalRef = useRef<IDirectoryModal>();
  const firstGlobalParamInputId = "firstGlobalParamInputId";
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
      </div>
      <div className={SelfStyle.contentWrap}>
        <div className="menuWrap">
          <Menu mode="inline" theme="light">
            {snippetList.map((snippet) => {
              return (
                <Menu.Item
                  key={snippet.script}
                  onClick={() => reqGetSnippetConfig(snippet)}
                >
                  {snippet.name}{" "}
                  <span className="script">{snippet.script}</span>
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
                  form={globalform}
                  name="basic"
                  layout="horizontal"
                  autoComplete="off"
                  initialValues={getGlobalInitialValues()}
                >
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
  function onWriteOs(snippetConfig: NProjectSnippet.IConfig) {
    globalform.validateFields().then(async () => {
      if (snippetConfig.writeOs.needFolder) {
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
            drafState.fragmentList[index].template = rsp.data;
          })
        );
        UCopy.copyStr(rsp.data);
      }
    });
  }
  function renderParamList(paramList: NProjectSnippet.IParam[]) {
    return paramList.map((param, index) => {
      let content: ReactNode = "";
      if (param.type === "input") {
        content = (
          <Input
            id={index == 0 ? firstGlobalParamInputId : ""}
            style={param.style}
          />
        );
      } else if (param.type === "switch") {
        content = <Switch></Switch>;
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
  async function reqGetSnippetConfig(snippet: NProjectSnippet) {
    setSnippet(snippet);
    const rsp = await SProject.getSnippetConfig({
      id: urlQuery.id,
      script: snippet.script,
    });
    if (rsp.success) {
      setSnippetConfig(rsp.data);
      setTimeout(() => {
        const input = document.getElementById("firstGlobalParamInputId");
        if (input) {
          input.focus();
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
      document.title = "代码片段 - " + projectRsp.data.name;
    }
  }
};
export default connect(({ MDProject, MDGlobal }: NModel.IState) => ({
  MDProject,
  MDGlobal,
}))(PProjectSnippet);
