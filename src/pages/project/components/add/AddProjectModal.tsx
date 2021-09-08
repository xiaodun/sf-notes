import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Input, Form } from "antd";
import SelfStyle from "./AddProjectModal";
import { FormInstance } from "antd/lib/form";

import produce from "immer";
import SProject from "../../SProject";
import NProject from "../../NProject";
export interface IAddProjectModalRef {
  showModal: () => void;
}
export interface IAddProjectModal {
  onOk: () => void;
}
export interface IAddProjectModalState {
  visible: boolean;
}
const defaultState: IAddProjectModalState = {
  visible: false,
};
const AddProjectModal: ForwardRefRenderFunction<
  IAddProjectModalRef,
  IAddProjectModal
> = (props, ref) => {
  const [state, setState] = useState<IAddProjectModalState>(defaultState);
  const layout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };
  const formRef = React.createRef<FormInstance>();
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        })
      );
      setTimeout(() => {
        document.getElementById("rootPathInput").focus();
      });
    },
  }));

  return (
    <Modal
      width="400px"
      title="添加项目"
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
      <Form ref={formRef} {...layout}>
        <Form.Item
          label="根路径"
          name="rootPath"
          rules={[{ required: true, message: "请输入项目的跟路径" }]}
        >
          <Input id="rootPathInput" onChange={onProgramPathChang} />
        </Form.Item>
        <Form.Item label="项目名" name="name">
          <Input disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
  function onCancel() {
    formRef.current.resetFields();
    setState(
      produce(state, (drafState) => {
        Object.keys(defaultState).forEach(
          (key) => (drafState[key] = defaultState[key])
        );
      })
    );
  }

  function onOk() {
    formRef.current.validateFields().then(async (...rest) => {
      const addRsp = await SProject.addProject(rest[0] as NProject);
      if (addRsp.success) {
        onCancel();
        props.onOk();
      }
    });
  }
  function onProgramPathChang(e: React.ChangeEvent<HTMLInputElement>) {
    let name = e.target.value.split("\\").pop();
    formRef.current.setFieldsValue({
      name,
    });
  }
};
export default forwardRef(AddProjectModal);
