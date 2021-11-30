import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input } from "antd";
import produce from "immer";
import SBase from "@/common/service/SBase";
import urlParse from "url-parse";
import USwagger from "@/common/utils/USwagger";
import NSwagger from "@/common/namespace/NSwagger";
import SelfStyle from "./EnterSwaggerModal.less";
import NProject from "../../NProject";
import SProject from "../../SProject";
export interface IEnterSwaggerModal {
  showModal: () => void;
}
export interface IEnterSwaggerProps {
  onOk: () => void;
}
export interface IEnterSwaggerModalState {
  visible: boolean;
  isAnalysisMode: boolean;
  parseNodeList: ReactNode[];
}
const defaultState: IEnterSwaggerModalState = {
  visible: false,
  isAnalysisMode: false,
  parseNodeList: [],
};
const EnterSwaggerModal: ForwardRefRenderFunction<
  IEnterSwaggerModal,
  IEnterSwaggerProps
> = (props, ref) => {
  const [state, setState] = useState<IEnterSwaggerModalState>(defaultState);
  const [form] = Form.useForm();
  const urlInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          setTimeout(() => {
            if (urlInputRef.current) {
              urlInputRef.current.focus();
            }
          }, 100);
        })
      );
    },
  }));

  return !state.isAnalysisMode ? (
    <Modal
      width="420px"
      title="录入Swagger信息"
      maskClosable={false}
      bodyStyle={{ maxHeight: "100%" }}
      visible={state.visible}
      footer={
        <Button type="primary" onClick={onOk}>
          确定
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Form form={form} name="basic" layout="vertical" autoComplete="off">
        <Form.Item
          label="Swagger文档地址"
          name="url"
          rules={[{ required: true }, { type: "url" }]}
        >
          <Input ref={urlInputRef} onPressEnter={onOk} />
        </Form.Item>
      </Form>
    </Modal>
  ) : (
    <Modal
      width="560px"
      title="解析Swagger进程"
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
      {state.parseNodeList.map((item, index) => (
        <div className={SelfStyle.textWrap} key={index}>
          {item}
        </div>
      ))}
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }
  async function onOk() {
    form.validateFields().then(async (values) => {
      let newData = produce(state, (drafState) => {
        drafState.isAnalysisMode = true;
      });
      setState(newData);

      const url = new urlParse(values.url);
      const featchGroupUrl = USwagger.getUrlByGroup(url.origin);
      const groupListRsp = await SBase.featchOtherDomainUrl<NSwagger.IGroup[]>(
        featchGroupUrl
      );
      if (groupListRsp.success) {
        newData = produce(newData, (drafState) => {
          drafState.parseNodeList.push(
            <h3>
              获取到
              <span style={{ color: "green" }}>{groupListRsp.data.length}</span>
              个分组
            </h3>
          );
        });
        setState(newData);
      }
      const groupWithTagList: NSwagger.IGroupWithTag = {};
      for (let i = 0; i < groupListRsp.data.length; i++) {
        const group = groupListRsp.data[i];
        newData = produce(newData, (drafState) => {
          drafState.parseNodeList.push(
            <span>
              开始解析
              <span style={{ fontWeight: "bold" }}>{group.name}</span>
            </span>
          );
        });
        setState(newData);
        const groupRsp = await SBase.featchOtherDomainUrl<NSwagger.IGroupApis>(
          url.origin + group.url
        );
        if (groupRsp.success) {
          const tagWithPaths = USwagger.intoTagOfPath(groupRsp.data);
          groupWithTagList[group.name] = tagWithPaths;
        }
      }

      //换算出用于页面渲染的数据结构
      let renderSwaggerInfos = {} as NProject.IRenderSwaggerInfo;
      Object.keys(groupWithTagList).forEach((groupName) => {
        const renderGroup = (renderSwaggerInfos[groupName] = {
          groupName,
          tags: {},
        });
        const renderTags = renderGroup.tags;
        const tagWithPaths = groupWithTagList[groupName];
        Object.keys(tagWithPaths).forEach((tagName) => {
          const pathInfos = tagWithPaths[tagName];
          const renderPaths = (renderTags[tagName] = {
            tagName,
            paths: {},
          });
          Object.keys(pathInfos).forEach((pathUrl) => {
            const methodInfo = pathInfos[pathUrl];
            renderPaths.paths[pathUrl] = USwagger.parseMethodInfo(
              pathUrl,
              methodInfo
            );
          });
        });
      });
      const saveRsp = await SProject.saveSwagger({
        data: renderSwaggerInfos,
        domain: url.origin,
      });
      if (saveRsp.success) {
        onCancel();
        props.onOk();
      }
    });
  }
};
export default forwardRef(EnterSwaggerModal);
