import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Modal, Button, Form, Input, message } from "antd";
import produce from "immer";
import NProject from "../../NProject";
import SProject from "../../SProject";
import NProjectSnippet from "../NProjectSnippet";
export interface ICreateGroupModal {
  showModal: (proect: NProject, snippetGroupList: NProjectSnippet[]) => void;
}
export interface ICreateGroupModalProps {
  onOk: () => void;
}

export interface ICreateGroupModalState {
  visible: boolean;
  project: NProject;
  snippetGroupList: NProjectSnippet[];
}
const defaultState: ICreateGroupModalState = {
  visible: false,
  project: null,
  snippetGroupList: [],
};
const CreateGroupModal: ForwardRefRenderFunction<
  ICreateGroupModal,
  ICreateGroupModalProps
> = (props, ref) => {
  const [state, setState] = useState<ICreateGroupModalState>(defaultState);
  const [form] = Form.useForm();
  const groupNameInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: (project: NProject, snippetGroupList: NProjectSnippet[]) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.project = project;
          drafState.snippetGroupList = snippetGroupList;
        })
      );
      setTimeout(() => {
        groupNameInputRef.current.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="创建代码分组"
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
        <Form.Item label="分组名:" name="name" rules={[{ required: true }]}>
          <Input ref={groupNameInputRef} onPressEnter={onOk} />
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
      const rsp = await SProject.createSnippetGroup({
        ...values,
        id: state.project.id,
        isGroup: true,
      });
      if (rsp.success) {
        onCancel();
        props.onOk();
      } else {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(CreateGroupModal);
