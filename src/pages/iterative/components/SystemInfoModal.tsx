import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from 'react';
import { Modal, Button, Tabs, Input } from 'antd';
import SelfStyle from './SystemInfoModal.less';
import { produce } from 'immer';
import { NMDIterative } from 'umi';
import UCopy from '@/common/utils/UCopy';
import NIterative from '../NIterative';
export interface ISystemInfoModal {
  showModal: () => void;
}
export interface ISystemInfoModalProps {
  MDIterative: NMDIterative.IState;
}

export interface ISystemInfoModalState {
  visible: boolean;
}
const defaultState: ISystemInfoModalState = {
  visible: false,
};
const ShowSystemInfoModalModal: ForwardRefRenderFunction<
  ISystemInfoModal,
  ISystemInfoModalProps
> = (props, ref) => {
  const { MDIterative } = props;
  const [state, setState] =
    useState<ISystemInfoModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        }),
      );
    },
  }));

  return (
    <Modal
      width="700px"
      title="系统信息"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
      visible={state.visible}
      footer={
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <Tabs tabPosition="left">
        {MDIterative.systemList
          .filter((systemTag) => systemTag.url)
          .map((systemTag) => (
            <Tabs.TabPane
              tab={systemTag.systemName}
              key={systemTag.id}
            >
              {systemTag.isMoreEnv ? (
                <>
                  <Button
                    style={{ marginBottom: 30 }}
                    type="primary"
                    onClick={() => onCopy(systemTag)}
                  >
                    全部复制
                  </Button>
                  {MDIterative.envList.map((env) => (
                    <div
                      className={SelfStyle.addressWrap}
                      key={env.id}
                    >
                      <div className="label">{env.envName}</div>
                      <Input
                        value={systemTag.address[env.branch]}
                      ></Input>
                      <Button
                        className="copy-btn"
                        onClick={() =>
                          UCopy.copyStr(systemTag.address[env.branch])
                        }
                      >
                        复制
                      </Button>
                      <Button className="jump-btn">
                        <a
                          href={systemTag.address[env.branch]}
                          target="_blank"
                        >
                          访问
                        </a>
                      </Button>
                    </div>
                  ))}
                </>
              ) : (
                <div className={SelfStyle.addressWrap}>
                  <Input value={systemTag.url}></Input>
                  <Button
                    className="copy-btn"
                    onClick={() => UCopy.copyStr(systemTag.url)}
                  >
                    复制
                  </Button>
                  <Button className="jump-btn">
                    <a href={systemTag.url} target="_blank">
                      访问
                    </a>
                  </Button>
                </div>
              )}
            </Tabs.TabPane>
          ))}
      </Tabs>
    </Modal>
  );
  function onCopy(systemTag: NIterative.ISystem) {
    UCopy.copyStr(
      MDIterative.envList
        .map(
          (env) =>
            `${env.envName} : ${systemTag.address[env.branch]}`,
        )
        .join('\n'),
    );
  }
  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(ShowSystemInfoModalModal);
