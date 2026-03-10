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
  open: boolean;
  strategy: string;
  valueType: 'number' | 'string';
}
const defaultState: IKeyValueExtractionModalState = {
  open: false,
  strategy: 'auto',
  valueType: 'number',
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
          drafState.open = true;
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
      open={state.open}
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
        <Form.Item name="valueType" initialValue="number">
          <Radio.Group
            onChange={(e) => {
              setState(
                produce(state, (drafState) => {
                  drafState.valueType = e.target.value;
                }),
              );
              reqKeyValueExtraction();
            }}
            buttonStyle="solid"
          >
            <Radio.Button value="number">数字</Radio.Button>
            <Radio.Button value="string">字符串</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item>
          <Space size={30}>
          <Radio.Group
            value={state.strategy}
            onChange={(e) => {
              const strategy = e.target.value;
              setState(
                produce(state, (drafState) => {
                  drafState.strategy = strategy;
                }),
              );
              reqKeyValueExtraction(strategy);
            }}
            buttonStyle="solid"
          >
            <Radio.Button value="auto">提取键值</Radio.Button>
            <Radio.Button value="onlyValue">提取英文</Radio.Button>
          </Radio.Group>
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
  async function reqKeyValueExtraction(strategyArg?: string) {
    form.validateFields().then(async (values) => {
      const strategy = strategyArg || state.strategy || 'auto';
      const rsp = await SProject.getKeyValueExtraction(
        strategy,
        values.content,
        values.valueType,
      );
      if (rsp.success) {
        setState(
          produce((drafState) => {
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
    form.setFieldsValue({
      valueType: defaultState.valueType,
    });
  }
};
export default forwardRef(KeyValueExtractionModal);
