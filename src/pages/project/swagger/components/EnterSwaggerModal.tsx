import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, Radio, Select } from "antd";
import produce from "immer";
import SBase from "@/common/service/SBase";
import urlParse from "url-parse";
import USwagger from "@/common/utils/USwagger";
import NSwagger from "@/common/namespace/NSwagger";
import SelfStyle from "./EnterSwaggerModal.less";
import NProject from "../../NProject";
import SProject from "../../SProject";
export interface IEnterSwaggerModal {
  showModal: (domainSwaggerList: NProject.IDomainSwagger[]) => void;
}
export interface IEnterSwaggerModalProps {
  onOk: () => void;
}
export type TEnterSwaggerModalWay = "add" | "update";
export interface IEnterSwaggerModalState {
  visible: boolean;
  isAnalysisMode: boolean;
  parseNodeList: ReactNode[];
  way: TEnterSwaggerModalWay;
}
const defaultState: IEnterSwaggerModalState = {
  visible: false,
  isAnalysisMode: false,
  parseNodeList: [],
  way: "add",
};
const EnterSwaggerModal: ForwardRefRenderFunction<
  IEnterSwaggerModal,
  IEnterSwaggerModalProps
> = (props, ref) => {
  const [state, setState] = useState<IEnterSwaggerModalState>(defaultState);
  const [domainNameList, setDomainNameList] = useState<string[]>([]);
  const [form] = Form.useForm();
  const urlInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: (domainSwaggerList: NProject.IDomainSwagger[]) => {
      setDomainNameList(domainSwaggerList.map((item) => item.domain));
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
      width="500px"
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
      <Form
        form={form}
        name="basic"
        layout="vertical"
        autoComplete="off"
        initialValues={{
          way: defaultState.way,
        }}
      >
        <Form.Item
          label="Swagger文档地址:"
          name="url"
          rules={[{ required: true }, { type: "url" }]}
        >
          <Input ref={urlInputRef} onPressEnter={onOk} />
        </Form.Item>
        <Form.Item label="方式:" name="way">
          <Radio.Group onChange={(e) => onWayChange(e.target.value)}>
            <Radio value={"add"}>新增</Radio>
            <Radio value={"update"}>覆盖</Radio>
          </Radio.Group>
        </Form.Item>
        {state.way === "update" && (
          <Form.Item
            label="域名:"
            name="domainName"
            rules={[{ required: true }]}
          >
            <Select>
              {domainNameList.map((item) => (
                <Select.Option key={item} value={item}>
                  {item}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        )}
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
  function onWayChange(way: TEnterSwaggerModalWay) {
    setState(
      produce(state, (drafState) => {
        drafState.way = way;
      })
    );
    if (way === "update") {
      form.validateFields().then(async (values) => {
        let url = new URL(values.url);
        const index = domainNameList.findIndex((item) => item === url.origin);
        form.setFieldsValue({
          domainName: domainNameList[index] || "",
        });
      });
    }
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
      const saveRsp = await SProject.saveSwagger(
        {
          data: renderSwaggerInfos,
          domain: url.origin,
        },
        state.way,
        values.domainName
      );
      if (saveRsp.success) {
        onCancel();
        props.onOk();
      }
    });
  }
};
export default forwardRef(EnterSwaggerModal);
