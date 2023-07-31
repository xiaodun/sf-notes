import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Modal, Button, Form, Input, Radio, Space } from 'antd';
import { produce } from 'immer';
import SelfStyle from './KeyValueExtractionModal.less';
import SProject from '../../SProject';
import SyntaxHighlighter from 'react-syntax-highlighter';
import NProjectSnippet from '../../snippet/NProjectSnippet';
export interface IKeyValueExtractionModal {
  showModal: () => void;
}
export interface IKeyValueExtractionModalProps {
  onEnumCode: (enumList: string[], values?: Object) => void;
}
export interface IKeyValueExtractionModalState
  extends NProjectSnippet.IExtractionResult {
  visible: boolean;
  strategy: string;
}
const defaultState: IKeyValueExtractionModalState = {
  visible: false,
  strategy: '',
  enumList: null,
  values: null,
  valueStr: '',
  enumStr: '',
};
const KeyValueExtractionModal: ForwardRefRenderFunction<
  IKeyValueExtractionModal,
  IKeyValueExtractionModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<IKeyValueExtractionModalState>(defaultState);
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
        }),
      );
    },
  }));

  return (
    <Modal
      width="560px"
      title="键值提取"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
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
      <Form
        form={form}
        name="basic"
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="输入想要提取的内容"
          name="content"
          rules={[{ required: true }]}
        >
          <Input.TextArea rows={5} ref={contentTextAreaRef} />
        </Form.Item>
        <Form.Item>
          <Space size={30}>
            <Button
              onClick={() => reqKeyValueExtraction('onlyValue')}
            >
              提取英文
            </Button>
            <Button
              onClick={() => reqKeyValueExtraction('valueDescribe')}
            >
              值前描述后
            </Button>
            <Button
              onClick={() => reqKeyValueExtraction('describeValue')}
            >
              描述前值后
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
    if (state.strategy === 'onlyValue') {
      if (state.enumList) {
        onCancel();
        props.onEnumCode(state.enumList);
      }
    } else {
      if (state.values) {
        onCancel();
        props.onEnumCode(state.enumList, state.values);
      }
    }
  }
  function renderExtractionResult() {
    const noResult = (
      <span style={{ color: '#C00000' }}> 没有提取到</span>
    );
    if (state.strategy === 'onlyValue') {
      if (state.enumList) {
        return (
          <div className="content">
            <SyntaxHighlighter>{state.enumStr}</SyntaxHighlighter>
          </div>
        );
      }

      return noResult;
    } else {
      if (state.values) {
        return (
          <div className="content">
            <SyntaxHighlighter>{state.valueStr}</SyntaxHighlighter>
          </div>
        );
      }
      return noResult;
    }
  }
  async function reqKeyValueExtraction(strategy: string) {
    form.validateFields().then(async (values) => {
      const rsp = await SProject.getKeyValueExtraction(
        strategy,
        values.content,
      );
      if (rsp.success) {
        setState(
          produce(state, (drafState) => {
            drafState.strategy = strategy;
            drafState.enumList = rsp.data.enumList;
            drafState.values = rsp.data.values;
            drafState.valueStr = rsp.data.valueStr;
            drafState.enumStr = rsp.data.enumStr;
          }),
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
