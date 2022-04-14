import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message, Select } from "antd";
import produce from "immer";
import NProject from "@/pages/project/NProject";
import NIterative from "../../NIterative";
import SIterative from "../../SIterative";
import { NMDIterative } from "umi";
export interface IAddProjectModal {
  showModal: () => void;
}
export interface IAddProjectModalProps {
  MDIterative: NMDIterative.IState;
  onOk: () => void;
}

export interface IAddProjectModalState {
  visible: boolean;
}
const defaultState: IAddProjectModalState = {
  visible: false,
};
const AddProjectModal: ForwardRefRenderFunction<
  IAddProjectModal,
  IAddProjectModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddProjectModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();
  const { MDIterative } = props;
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        })
      );
      setTimeout(() => {
        firstInputRef.current?.focus();
        form.setFieldsValue({
          branchName: MDIterative.gitConfig.newBranchDefaultPrefix,
        });
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="添加项目"
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
          label="涉及项目"
          name={"projectList"}
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
          label="分支名"
          name={"branchName"}
          rules={[{ required: true }]}
        >
          <Input></Input>
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
      // const rsp = await SIterative.addProjectList({
      //   id: state.project.id,
      //   isGroup: true,
      // });
      // if (rsp.success) {
      //   onCancel();
      //   props.onOk();
      // } else {
      //   message.error(rsp.message);
      // }
    });
  }
};
export default forwardRef(AddProjectModal);
