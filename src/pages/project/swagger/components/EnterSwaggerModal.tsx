import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Radio,
  Select,
  Checkbox,
  message,
} from "antd";
import { produce } from "immer";
import SBase from "@/common/service/SBase";
import urlParse from "url-parse";
import USwagger from "@/common/utils/USwagger";
import NSwagger from "@/common/namespace/NSwagger";
import SelfStyle from "./EnterSwaggerModal.less";
import NProject from "../../NProject";
import SProject from "../../SProject";
import { NMDProject } from "umi";

export interface IEnterSwaggerModal {
  showModal: (
    domainSwaggerList: NProject.IDomainSwagger[],
    MDProject: NMDProject.IState
  ) => void;
  reload: (url: string, inExcludeGroups: NProject.IInExcludeGroups) => void;
}
export interface IEnterSwaggerModalProps {
  onOk: () => void;
}
export type TEnterSwaggerModalWay = "add" | "update";
export interface IEnterSwaggerModalState {
  checkGroupNameList: string[];
  isEnterLoading: boolean;
  open: boolean;
  isAnalysisMode: boolean;
  parseNodeList: ReactNode[];
  way: TEnterSwaggerModalWay;
}
interface ITempData {
  domain: string;
  formDomainName: string;
  inExcludeGroups: NProject.IInExcludeGroups;
  renderSwaggerInfos: NProject.IRenderSwaggerInfo;
}
const defaultTempData: ITempData = {
  inExcludeGroups: {},
  formDomainName: "",
  domain: "",
  renderSwaggerInfos: null,
};
const defaultState: IEnterSwaggerModalState = {
  checkGroupNameList: [],
  isEnterLoading: true,
  open: false,
  isAnalysisMode: false,
  parseNodeList: [],
  way: "add",
};
const EnterSwaggerModal: ForwardRefRenderFunction<
  IEnterSwaggerModal,
  IEnterSwaggerModalProps
> = (props, ref) => {
  const [state, setState] = useState<IEnterSwaggerModalState>(defaultState);
  const tempDataRef = useRef<ITempData>(defaultTempData);
  const [domainNameList, setDomainNameList] = useState<string[]>([]);
  const [form] = Form.useForm();
  const urlInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: (
      domainSwaggerList: NProject.IDomainSwagger[],
      MDProject: NMDProject.IState
    ) => {
      setDomainNameList(domainSwaggerList.map((item) => item.domain));
      setState(
        produce(state, (drafState) => {
          drafState.open = true;
          tempDataRef.current.inExcludeGroups = MDProject.inExcludeGroups;
          form.setFieldsValue({
            url: MDProject.config.lastOptionSwaggerDomain,
            version: MDProject.config.lastOptionSwaggerVersion,
          });
          setTimeout(() => {
            if (urlInputRef.current) {
              urlInputRef.current.focus();
            }
          }, 100);
        })
      );
    },
    reload: async (url: string, inExcludeGroups: NProject.IInExcludeGroups) => {
      tempDataRef.current.inExcludeGroups = inExcludeGroups;

      fetchSwaggerDoc(url, {});
    },
  }));

  return !state.isAnalysisMode ? (
    <Modal
      width="500px"
      title="录入Swagger信息"
      maskClosable={false}
      bodyStyle={{ maxHeight: "100%" }}
      open={state.open}
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
        <Form.Item label="版本:" name="version">
          <Radio.Group>
            <Radio value={"2"}>2.0</Radio>
            <Radio value={"3"}>3.0</Radio>
          </Radio.Group>
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
      open={state.open}
      footer={
        <>
          <Button onClick={onCancel}>关闭</Button>
          <Button
            type="primary"
            onClick={onSaveSwagger}
            loading={state.isEnterLoading}
          >
            确定
          </Button>
        </>
      }
      onCancel={onCancel}
      centered
    >
      <Checkbox.Group
        value={state.checkGroupNameList}
        onChange={(list) => {
          setState(
            produce(state, (drafState) => {
              drafState.checkGroupNameList = list as string[];
            })
          );
        }}
      >
        {state.parseNodeList.map((item, index) => (
          <div className={SelfStyle.textWrap} key={index}>
            {item}
          </div>
        ))}
      </Checkbox.Group>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    tempDataRef.current = defaultTempData;
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
  async function fetchSwaggerDoc(url: string, formValues: any = {}) {
    let newData = produce(state, (drafState) => {
      drafState.open = true;
      drafState.isAnalysisMode = true;
      drafState.checkGroupNameList =
        tempDataRef.current.inExcludeGroups?.[url] || [];
    });

    setState(newData);

    const featchGroupUrl = USwagger.getUrlByGroup(url);

    const groupListRsp = await SBase.fetchOtherDomainUrl<NSwagger.IGroup[]>(
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
            <Checkbox style={{ marginRight: 10 }} value={group.name}>
              <span style={{ fontWeight: "bold" }}>{group.name}</span>
            </Checkbox>
          </span>
        );
      });
      setState(newData);
      const groupRsp = await SBase.fetchOtherDomainUrl<NSwagger.IGroupApis>(
        url + group.url
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
            methodInfo,
            formValues.version
          );
        });
      });
    });

    tempDataRef.current.domain = url;
    tempDataRef.current.renderSwaggerInfos = renderSwaggerInfos;
    tempDataRef.current.formDomainName = formValues.domainName;
    setState(
      produce(newData, (drafState) => {
        drafState.isEnterLoading = false;
      })
    );
  }
  async function onSaveSwagger() {
    if (!state.checkGroupNameList.length) {
      message.error("请勾选分组");

      return;
    }
    await SProject.saveSwagger(
      {
        data: tempDataRef.current.renderSwaggerInfos,
        domain: tempDataRef.current.domain,
      },
      state.way,
      tempDataRef.current.formDomainName,
      state.checkGroupNameList
    );

    props.onOk();
    onCancel();
  }
  function onOk() {
    form.validateFields().then(async (values) => {
      const urlParseInfo = new urlParse(values.url);
      let url;
      if (values.version == 2) {
        url = urlParseInfo.origin;
      } else if (values.version == 3) {
        url = urlParseInfo.origin + "/" + urlParseInfo.pathname.split("/")[1];
      }
      fetchSwaggerDoc(url, values);
    });
  }
};
export default forwardRef(EnterSwaggerModal);
