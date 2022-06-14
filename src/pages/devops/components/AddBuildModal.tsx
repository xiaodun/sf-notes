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
import { UModal } from "@/common/utils/modal/UModal";
export interface IAddBuildModal {
  showModal: () => void;
}
export interface IAddBuildModalProps {
  MDIterative: NMDIterative.IState;
  MDDevops: NMDDevops.IState;
  onOk: () => void;
}

export interface IAddBuildModalState {
  visible: boolean;
  loading: boolean;
}
const defaultState: IAddBuildModalState = {
  visible: false,
  loading: false,
};
const AddBuildModal: ForwardRefRenderFunction<
  IAddBuildModal,
  IAddBuildModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddBuildModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();
  const { MDIterative, MDDevops } = props;

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          if (MDDevops.config.lastOptionEnvId) {
            form.setFieldsValue({
              projectNameList: MDDevops.config.lastOptionProjectNameList,
              envId: MDDevops.config.lastOptionEnvId,
            });
          }
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
      title="构建"
      maskClosable={false}
      bodyStyle={{ maxHeight: "100%" }}
      visible={state.visible}
      footer={
        <Button loading={state.loading} type="primary" onClick={onOk}>
          确定
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Form form={form} name="basic" layout="vertical" autoComplete="off">
        <Form.Item
          label="项目"
          name={"projectNameList"}
          rules={[{ required: true }]}
        >
          <Select
            mode="tags"
            allowClear={true}
            placeholder="搜索内容"
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            optionFilterProp="children"
          >
            {MDIterative.projectList.map((item) => (
              <Select.Option key={item.name} value={item.name}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
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
      setState(
        produce(state, (drafState) => {
          drafState.loading = true;
        })
      );
      const branch = MDIterative.envList.find(
        (item) => item.id === values.envId
      ).branch;
      const rsp = await SDevops.addDevopsBuild(
        values.projectNameList,
        values.envId,
        branch,
        MDDevops.developPerson.personName
      );
      setState(
        produce(state, (drafState) => {
          drafState.loading = false;
        })
      );
      if (rsp.success) {
        message.success("提交成功");
        onCancel();
        props.onOk();
      } else {
        UModal.showExecResult(rsp.data.execResultList);
      }
    });
  }
};
export default forwardRef(AddBuildModal);
