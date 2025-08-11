import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from 'react';
import { Modal, Button, Tabs, Input, Tag, Space } from 'antd';
import { produce } from 'immer';
import { NMDIterative } from 'umi';
import NIterative from '../NIterative';
import SelfStyle from './RoleAccontInfoModal.less';
import UCopy from '@/common/utils/UCopy';
export interface IRoleAccontInfoModal {
  showModal: (roleInfos: NIterative.IPerson) => void;
}
export interface IRoleAccontInfoModalProps {
  MDIterative: NMDIterative.IState;
}

export interface IRoleAccontInfoModalState {
  open: boolean;
  accountInfos: {
    [key: string]: NIterative.IAccount[];
  };
}
const defaultState: IRoleAccontInfoModalState = {
  open: false,
  accountInfos: {},
};
const RoleAccontInfoModal: ForwardRefRenderFunction<
  IRoleAccontInfoModal,
  IRoleAccontInfoModalProps
> = (props, ref) => {
  const { MDIterative } = props;
  const [state, setState] =
    useState<IRoleAccontInfoModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: (roleInfos: NIterative.IPerson) => {
      setState(
        produce(state, (drafState) => {
          drafState.open = true;
          drafState.accountInfos = roleInfos.accountList.reduce(
            (pre, cur) => {
              if (!pre[cur.systemId]) {
                pre[cur.systemId] = [];
              }

              pre[cur.systemId].push(cur);

              return pre;
            },
            {},
          );
        }),
      );
    },
  }));

  return (
    <Modal
      width="680px"
      title="账号信息"
      maskClosable={false}
      bodyStyle={{ maxHeight: '100%' }}
      open={state.open}
      footer={
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      {Object.keys(state.accountInfos).length === 0 && (
        <div className={SelfStyle.noData}>没有账号信息</div>
      )}
      <Tabs tabPosition="left">
        {Object.keys(state.accountInfos).map((id) => {
          const accountList = state.accountInfos[id];
          return (
            <Tabs.TabPane tab={accountList[0].systemName} key={id}>
              {accountList.map((item, accountIndex) => (
                <div
                  className={SelfStyle.accountWrap}
                  key={accountIndex}
                >
                  <div className="able-wrap">
                    <Button
                      type="link"
                      onClick={() =>
                        UCopy.copyStr(
                          item.userName + '\n' + item.password,
                        )
                      }
                    >
                      分享
                    </Button>
                  </div>
                  <div className="info-wrap">
                    {item.envNameList?.length > 0 && (
                      <div className="tags-wrap">
                        <Space>
                          {item.envNameList.map((env) => (
                            <Tag color={'#5bd1d7'} key={env}>
                              {env}
                            </Tag>
                          ))}
                        </Space>
                      </div>
                    )}

                    <div className="line-block">
                      <div className="label">用户名</div>
                      <Input value={item.userName}></Input>
                      <Button
                        onClick={() => UCopy.copyStr(item.userName)}
                      >
                        复制
                      </Button>
                    </div>
                    <div className="line-block">
                      <div className="label">密码</div>
                      <Input value={item.password}></Input>
                      <Button
                        onClick={() => UCopy.copyStr(item.password)}
                      >
                        复制
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </Tabs.TabPane>
          );
        })}
      </Tabs>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(RoleAccontInfoModal);
