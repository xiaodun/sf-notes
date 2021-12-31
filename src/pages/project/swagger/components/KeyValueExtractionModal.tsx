import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, Radio, Space } from "antd";
import produce from "immer";
import SelfStyle from "./KeyValueExtractionModal.less";
import SProject from "../../SProject";
export interface IKeyValueExtractionModal {
  showModal: () => void;
}
export interface IKeyValueExtractionModalProps {
  onEnumCode: (enumList: string[], values?: Object) => void;
}
export interface IKeyValueExtractionModalState {
  visible: boolean;
  strategy: string;
  enumList: string[];
  values: Object;
}
const defaultState: IKeyValueExtractionModalState = {
  visible: false,
  strategy: "",
  enumList: null,
  values: null,
};
const KeyValueExtractionModal: ForwardRefRenderFunction<
  IKeyValueExtractionModal,
  IKeyValueExtractionModalProps
> = (props, ref) => {
  const [state, setState] = useState<IKeyValueExtractionModalState>(
    defaultState
  );
  const [form] = Form.useForm();
  const contentTextAreaRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          setTimeout(() => {
            if (contentTextAreaRef.current) {
              contentTextAreaRef.current.focus();
            }
          }, 100);
        })
      );
    },
  }));

  return (
    <Modal
      width="560px"
      title="键值提取"
      maskClosable={false}
      bodyStyle={{ maxHeight: "100%" }}
      visible={state.visible}
      footer={
        <Space size={30}>
          <Button type="primary" onClick={generateEnumCode}>
            枚举代码
          </Button>
          <Button onClick={onCancel}>关闭</Button>
        </Space>
      }
      onCancel={onCancel}
      centered
    >
      <Form form={form} name="basic" layout="vertical" autoComplete="off">
        <Form.Item
          label="输入想要提取的内容"
          name="content"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={5} ref={contentTextAreaRef} />
        </Form.Item>
        <Form.Item>
          <Space size={30}>
            <Button onClick={() => reqKeyValueExtraction("onlyEnglish")}>
              提取英文
            </Button>
            <Button
              onClick={() => reqKeyValueExtraction("englishKeyChineseDesc")}
            >
              提取英文键和中文描述
            </Button>
          </Space>
        </Form.Item>
        {state.strategy && (
          <Form.Item label="结果">
            <div className={SelfStyle.contentWrap}>
              {renderExtractionResult()}
            </div>
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
  function generateEnumCode() {
    if (state.strategy === "onlyEnglish") {
      if (state.enumList) {
        props.onEnumCode(state.enumList);
      }
    } else if (state.strategy === "englishKeyChineseDesc") {
      if (state.values) {
        props.onEnumCode(state.enumList, state.values);
      }
    }
  }
  function renderExtractionResult() {
    const noResult = <span style={{ color: "#C00000" }}> 没有提取到</span>;
    if (state.strategy === "onlyEnglish") {
      if (state.enumList) {
        return <div className="content">{JSON.stringify(state.enumList)}</div>;
      }

      return noResult;
    } else if (state.strategy == "englishKeyChineseDesc") {
      if (state.values) {
        return <div className="content">{JSON.stringify(state.values)}</div>;
      }
      return noResult;
    }

    return "";
  }
  async function reqKeyValueExtraction(strategy: string) {
    form.validateFields().then(async (values) => {
      const rsp = await SProject.getKeyValueExtraction(
        strategy,
        values.content
      );
      if (rsp.success) {
        setState(
          produce(state, (drafState) => {
            drafState.strategy = strategy;

            drafState.enumList = rsp.data.enumList;
            drafState.values = rsp.data.values;
          })
        );
      }
    });
  }
  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }
};
export default forwardRef(KeyValueExtractionModal);
