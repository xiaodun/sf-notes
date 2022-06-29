import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, Select } from "antd";
import produce from "immer";
import { NMDIterative } from "umi";
import SIterative from "../../SIterative";
export type TSelectModalTarget = "merge" | "build";
export interface ISelectEnvModal {
  showModal: (target: TSelectModalTarget) => void;
}
export interface ISelectEnvModalProps {
  MDIterative: NMDIterative.IState;
  onOk: (envId: number, target: TSelectModalTarget) => void;
}

export interface ISelectEnvModalState {
  visible: boolean;
  target: TSelectModalTarget;
}
const defaultState: ISelectEnvModalState = {
  visible: false,
  target: null,
};
const SelectEnvModal: ForwardRefRenderFunction<
  ISelectEnvModal,
  ISelectEnvModalProps
> = (props, ref) => {
  const { MDIterative } = props;
  const [state, setState] = useState<ISelectEnvModalState>(defaultState);
  const [form] = Form.useForm();

  useImperativeHandle(ref, () => ({
    showModal: (target: TSelectModalTarget) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.target = target;
        })
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
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
      props.onOk(values.envId, state.target);
      SIterative.updateIterative(MDIterative.iterative.id, {
        lastOperationEnvId: values.envId,
      });
      onCancel();
    });
  }
};
export default forwardRef(SelectEnvModal);
