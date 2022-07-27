import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message, Select } from "antd";
import produce from "immer";
import { NMDIterative } from "umi";
import SIterative from "../../SIterative";
import NIterative from "../../NIterative";
export interface IMarkTagModal {
  showModal: () => void;
}
export interface IMarkTagModalProps {
  MDIterative: NMDIterative.IState;
}

export interface IMarkTagModalState {
  visible: boolean;
}
const defaultState: IMarkTagModalState = {
  visible: false,
};
const MarkTagModal: ForwardRefRenderFunction<
  IMarkTagModal,
  IMarkTagModalProps
> = (props, ref) => {
  const [state, setState] = useState<IMarkTagModalState>(defaultState);
  const [form] = Form.useForm();
  const { MDIterative } = props;

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          if (MDIterative.iterative.markTags?.envIdList?.length) {
            form.setFieldsValue({
              envIdList: MDIterative.iterative.markTags.envIdList,
            });
          }
        })
      );
    },
  }));

  return (
    <Modal
      width="500px"
      title="打标签"
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
          name="envIdList"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            mode="tags"
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
    form.validateFields().then(async (values: NIterative.IMarkTag) => {
      const rsp = await SIterative.markTag(MDIterative.iterative.id, values);
      if (rsp.success) {
        onCancel();
      } else if (!rsp.isHaveReadMsg) {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(MarkTagModal);
