import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Modal, Button, Form, Input, Select } from 'antd';
import { produce } from 'immer';
import { NMDIterative } from 'umi';
import SIterative from '../../SIterative';
export interface ISelectEnvModal {
  showModal: () => void;
}
export interface ISelectEnvModalProps {
  MDIterative: NMDIterative.IState;
  onOk: (envId: number) => void;
}

export interface ISelectEnvModalState {
  open: boolean;
}
const defaultState: ISelectEnvModalState = {
  open: false,
};
const SelectEnvModal: ForwardRefRenderFunction<
  ISelectEnvModal,
  ISelectEnvModalProps
> = (props, ref) => {
  const { MDIterative } = props;
  const [state, setState] =
    useState<ISelectEnvModalState>(defaultState);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.open = true;
        }),
      );

      form.setFieldsValue({
        envId: MDIterative.iterative.lastOperationEnvId,
      });
    },
  }));

  return (
    <Modal
      width="500px"
      title="混合到"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
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
      >
        <Form.Item
          label="环境"
          name="envId"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            showSearch
            filterOption={(input, option) =>
              option.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
            optionFilterProp="children"
          >
            {MDIterative.envList.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.envName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
    form.resetFields();
  }

  async function onOk() {
    form.validateFields().then(async (values) => {
      props.onOk(values.envId);
      SIterative.updateIterative(MDIterative.iterative.id, {
        lastOperationEnvId: values.envId,
      });
      onCancel();
    });
  }
};
export default forwardRef(SelectEnvModal);
