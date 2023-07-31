import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Modal, Button, Form, Input, message, Select } from 'antd';
import { produce } from 'immer';
import NProject from '../../NProject';
import SProject from '../../SProject';
import NProjectSnippet from '../NProjectSnippet';
export interface ICreateSnipeetModal {
  showModal: (
    proect: NProject,
    snippetGroupList: NProjectSnippet[],
  ) => void;
}
export interface ICreateSnipeetModalProps {
  onOk: () => void;
}

export interface ICreateSnipeetModalState {
  visible: boolean;
  project: NProject;
  snippetGroupList: NProjectSnippet[];
}
const defaultState: ICreateSnipeetModalState = {
  visible: false,
  project: null,
  snippetGroupList: [],
};
const CreateSnipeetModal: ForwardRefRenderFunction<
  ICreateSnipeetModal,
  ICreateSnipeetModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<ICreateSnipeetModalState>(defaultState);
  const [form] = Form.useForm();
  const nameInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: (
      project: NProject,
      snippetGroupList: NProjectSnippet[],
    ) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.project = project;
          drafState.snippetGroupList = snippetGroupList;
        }),
      );
      setTimeout(() => {
        nameInputRef.current.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="创建代码片段"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
      visible={state.visible}
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
          label="片段名:"
          name="name"
          rules={[{ required: true }]}
        >
          <Input
            ref={nameInputRef}
            onPressEnter={onOk}
            placeholder="简略描述代码片段的功能"
          />
        </Form.Item>
        <Form.Item
          label="脚本文件名:"
          name="script"
          rules={[{ required: true }]}
        >
          <Input
            onPressEnter={onOk}
            placeholder="用于数据承载和逻辑执行"
          />
        </Form.Item>
        <Form.Item label="选择分组:" name="groupName" rules={[]}>
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {state.snippetGroupList.map((item) => (
              <Select.Option key={item.name} value={item.name}>
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
      const rsp = await SProject.createProjectSnippet({
        ...values,
        id: state.project.id,
      });
      if (rsp.success) {
        onCancel();
        props.onOk();
      } else if (!rsp.isHaveReadMsg) {
        message.error(rsp.message);
      }
    });
  }
};
export default forwardRef(CreateSnipeetModal);
