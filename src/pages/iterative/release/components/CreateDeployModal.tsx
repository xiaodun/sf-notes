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
export interface ICreateDeployModal {
  showModal: () => void;
}
export interface ICreateDeployModalProps {
  MDIterative: NMDIterative.IState;
  onOk: (
    buildAccount: NIterative.IAccount,
    deployAccount: NIterative.IAccount,
    deployPersonIdList: number[],
    releasePersonIdList: number[],
    envId: number,
    systemId: number
  ) => void;
}

export interface ICreateDeployModalState {
  visible: boolean;
  systemAccountList: NIterative.IAccount[];
}
const defaultState: ICreateDeployModalState = {
  visible: false,
  systemAccountList: [],
};
const CreateDeployModal: ForwardRefRenderFunction<
  ICreateDeployModal,
  ICreateDeployModalProps
> = (props, ref) => {
  const { MDIterative } = props;
  const { iterative, releaseConfig } = MDIterative;
  const [state, setState] = useState<ICreateDeployModalState>(defaultState);
  const [form] = Form.useForm();
  const firstInputRef = useRef<Input>();

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        })
      );
      form.setFieldsValue({
        envId: iterative.lastOperationEnvId,
        systemId: releaseConfig.lastOperationSystemId,
        deployPersonIdList: iterative.lastOperationDeployPersonIdList,
        releasePersonIdList: iterative.lastOperationReleasePersonIdList,
      });
      if (releaseConfig.lastOperationSystemId) {
        SIterative.getSystemAccountList(
          releaseConfig.lastOperationSystemId
        ).then((rsp) => {
          if (rsp.success) {
            setState(
              produce(state, (drafState) => {
                drafState.visible = true;

                drafState.systemAccountList = rsp.list;
              })
            );
            form.setFieldsValue({
              buildAccountId: releaseConfig.lastOperationBuildAccountId,
              deployAccountId: releaseConfig.lastOperationDeployAccountId,
            });
          }
        });
      }
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 20);
    },
  }));

  return (
    <Modal
      width="500px"
      title="创建部署"
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
        <Form.Item label="系统" name="systemId" rules={[{ required: true }]}>
          <Select
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
            onChange={onSystemIdChange}
            optionFilterProp="children"
          >
            {MDIterative.systemList.map((item) => (
              <Select.Option key={item.id} value={item.id}>
                {item.systemName}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        {form.getFieldValue("systemId") && (
          <>
            <Form.Item
              label="构建账号"
              name="buildAccountId"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                optionFilterProp="children"
              >
                {state.systemAccountList.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.personName} -- {item.userName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="部署账号"
              name="deployAccountId"
              rules={[{ required: true }]}
            >
              <Select
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >=
                  0
                }
                optionFilterProp="children"
              >
                {state.systemAccountList.map((item) => (
                  <Select.Option key={item.id} value={item.id}>
                    {item.personName} -- {item.userName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </>
        )}
        <Form.Item label="部署通知人员" name="deployPersonIdList">
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
        <Form.Item label="发版通知人员" name="releasePersonIdList">
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
  async function onSystemIdChange(systemId: number) {
    form.setFieldsValue({
      buildAccountId: null,
      deployAccountId: null,
    });
    setState(
      produce(state, (drafState) => {
        drafState.systemAccountList = [];
      })
    );

    const rsp = await SIterative.getSystemAccountList(systemId);
    if (rsp.success) {
      setState(
        produce(state, (drafState) => {
          drafState.systemAccountList = rsp.list;
        })
      );
    }
  }
  async function onOk() {
    form.validateFields().then(async (values) => {
      const buildAccount = state.systemAccountList.find(
        (item) => item.id === values.buildAccountId
      );
      const deployAccount = state.systemAccountList.find(
        (item) => item.id === values.deployAccountId
      );
      onCancel();
      props.onOk(
        buildAccount,
        deployAccount,
        values.deployPersonIdList,
        values.releasePersonIdList,
        values.envId,
        values.systemId
      );
    });
  }
};
export default forwardRef(CreateDeployModal);
