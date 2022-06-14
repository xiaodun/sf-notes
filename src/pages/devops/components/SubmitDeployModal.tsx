import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message, Select } from "antd";
import produce from "immer";
import { NMDIterative, NMDDevops } from "umi";
import SDevops from "../SDevops";
import NDevops from "../NDevops";
export interface ISubmitDeployModal {
  showModal: (env: string, devlopData: NDevops.IDeployDataItem[]) => void;
}
export interface ISubmitDeployModalProps {
  onOk: () => void;
  MDIterative: NMDIterative.IState;
  MDDevops: NMDDevops.IState;
}

export interface ISubmitDeployModalState {
  visible: boolean;
  loading: boolean;
  env: string;
  devlopData: NDevops.IDeployDataItem[];
}
const defaultState: ISubmitDeployModalState = {
  visible: false,
  loading: false,
  env: "",
  devlopData: [],
};
const SubmitDeployModal: ForwardRefRenderFunction<
  ISubmitDeployModal,
  ISubmitDeployModalProps
> = (props, ref) => {
  const { MDIterative, MDDevops } = props;
  const [state, setState] = useState<ISubmitDeployModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: (env: string, devlopData: NDevops.IDeployDataItem[]) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.env = env;
          drafState.devlopData = devlopData;
        })
      );
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="部署"
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
        <Form.Item label="更新内容" name="content" rules={[{ required: true }]}>
          <Input.TextArea rows={3}></Input.TextArea>
        </Form.Item>
        <Form.Item
          label="通知人员"
          name="noticePersonList"
          rules={[{ required: true }]}
        >
          <Select
            mode="tags"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            optionFilterProp="children"
          >
            {MDIterative.personList.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.name}
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
      setState(
        produce(state, (drafState) => {
          drafState.loading = true;
        })
      );
      const rsp = await SDevops.submitDevlopsDeploy(
        state.env,
        state.devlopData,
        MDDevops.developPerson.personName,
        values.noticePersonList
      );
      if (rsp.success) {
        onCancel();
        props.onOk();
      } else {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(SubmitDeployModal);
