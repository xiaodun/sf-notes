import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, Tabs } from "antd";
import produce from "immer";
import SBase from "@/common/service/SBase";
import urlParse from "url-parse";
import USwagger from "@/common/utils/USwagger";
import NSwagger from "@/common/namespace/NSwagger";
import SelfStyle from "./GenerateAjaxCodeModal.less";
import NProject from "../../NProject";
import SProject from "../../SProject";
import { lte } from "lodash";
import UCopy from "@/common/utils/UCopy";
export interface IGenerateAjaxCodeModal {
  showModal: (checkPathList: NProject.IMenuCheckbox[]) => void;
}
export interface IEnterSwaggerProps {}
export interface IGenerateAjaxCodeModalState {
  visible: boolean;
  checkedPathList: NProject.IMenuCheckbox[];
}
const defaultState: IGenerateAjaxCodeModalState = {
  visible: false,
  checkedPathList: [],
};
const GenerateAjaxCodeModal: ForwardRefRenderFunction<
  IGenerateAjaxCodeModal,
  IEnterSwaggerProps
> = (props, ref) => {
  const [state, setState] = useState<IGenerateAjaxCodeModalState>({
    ...defaultState,
  });
  const [projectList, setProjectList] = useState<NProject[]>([]);
  const [activeTabKey, setActiveTabKey] = useState<string>("");
  const [defaultTabKey, setDefaultTabKey] = useState<string>("");
  const [ajaxCodeWrap, setAjaxCodeWrap] = useState<NProject.IAjaxCodeWrap>({});
  useImperativeHandle(ref, () => ({
    showModal: (checkedPathList: NProject.IMenuCheckbox[]) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.checkedPathList = checkedPathList;
        })
      );
      reqGetProjectList(checkedPathList);
    },
  }));

  return (
    <Modal
      width="960px"
      title="生成ajax代码"
      maskClosable={false}
      bodyStyle={{ maxHeight: "100%" }}
      visible={state.visible}
      footer={
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <div className={SelfStyle.main}>
        <Tabs
          tabPosition="left"
          activeKey={activeTabKey}
          onChange={onTabChange}
        >
          {projectList.map((project) => {
            const ajaxCodeList = ajaxCodeWrap[project.name];
            return (
              <Tabs.TabPane tab={project.name} key={project.name}>
                <div className={SelfStyle.ableWrap}>
                  {defaultTabKey !== project.name && (
                    <Button onClick={reqSetDefaultAjaxCode}>设为默认</Button>
                  )}
                </div>
                <div className={SelfStyle.contentWrap}>
                  {ajaxCodeList &&
                    ajaxCodeList.map((item) => {
                      return (
                        <>
                          <div className={SelfStyle.titleWrap}>
                            <div className="title">{item.name}</div>
                            <Button onClick={() => UCopy.copyStr(item.data)}>
                              复制代码
                            </Button>
                          </div>
                          <div className={SelfStyle.codeWrap}>
                            <pre>{item.data}</pre>
                          </div>
                        </>
                      );
                    })}
                </div>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    </Modal>
  );
  async function reqSetDefaultAjaxCode() {}
  async function reqGetAjaxCode(
    projectName: string,
    checkedPathList: NProject.IMenuCheckbox[]
  ) {
    const rsp = await SProject.getAjaxCode(projectName, checkedPathList);
    if (rsp.success) {
      setAjaxCodeWrap(
        produce(ajaxCodeWrap, (drafState) => {
          drafState[projectName] = rsp.list;
        })
      );
    }
  }
  async function reqGetProjectList(checkedPathList: NProject.IMenuCheckbox[]) {
    const rsp = await SProject.getProjectList();
    if (rsp.success) {
      setProjectList(rsp.list);
      let defaultProject = rsp.list.find(
        (project) => project.isDefaultAjaxCode
      );
      if (defaultProject) {
        setActiveTabKey(defaultProject.name);
        setDefaultTabKey(defaultProject.name);
        reqGetAjaxCode(defaultProject.name, checkedPathList);
      } else {
        if (rsp.list.length) {
          defaultProject = rsp.list[0];
          setActiveTabKey(defaultProject.name);
          reqGetAjaxCode(defaultProject.name, checkedPathList);
        }
      }
    }
  }
  function onTabChange(key: string) {
    setActiveTabKey(key);
    if (!ajaxCodeWrap[key]) {
      reqGetAjaxCode(key, state.checkedPathList);
    }
  }
  function onCancel() {
    setState(defaultState);
    setAjaxCodeWrap({});
    setDefaultTabKey("");
  }
};
export default forwardRef(GenerateAjaxCodeModal);
