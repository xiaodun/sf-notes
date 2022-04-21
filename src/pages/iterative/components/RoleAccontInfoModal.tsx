import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Tabs, Input, Tag } from "antd";
import produce from "immer";
import { NMDIterative } from "umi";
import NIterative from "../NIterative";
import SelfStyle from "./RoleAccontInfoModal.less";
import UCopy from "@/common/utils/UCopy";
export interface IRoleAccontInfoModal {
  showModal: (roleInfos: NIterative.IPerson) => void;
}
export interface IRoleAccontInfoModalProps {
  MDIterative: NMDIterative.IState;
}

export interface IRoleAccontInfoModalState {
  visible: boolean;
  accountInfos: {
    [key: string]: NIterative.IAccount[];
  };
}
const defaultState: IRoleAccontInfoModalState = {
  visible: false,
  accountInfos: {},
};
const RoleAccontInfoModal: ForwardRefRenderFunction<
  IRoleAccontInfoModal,
  IRoleAccontInfoModalProps
> = (props, ref) => {
  const { MDIterative } = props;
  const [state, setState] = useState<IRoleAccontInfoModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: (roleInfos: NIterative.IPerson) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.accountInfos = roleInfos.accountList.reduce((pre, cur) => {
            if (!pre[cur.systemId]) {
              pre[cur.systemId] = [];
            }

            pre[cur.systemId].push(cur);

            return pre;
          }, {});
        })
      );
    },
  }));

  return (
    <Modal
      width="680px"
      title="账号信息"
      maskClosable={false}
      bodyStyle={{ maxHeight: "100%" }}
      visible={state.visible}
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
        {Object.keys(state.accountInfos).map((systemName) => (
          <Tabs.TabPane tab={systemName} key={systemName}>
            {state.accountInfos[systemName].map((item) => (
              <div className={SelfStyle.accountWrap}>
                <div className="info-wrap">
                  {item.envNameList.length > 0 && (
                    <div className="tags-wrap">
                      {item.envNameList.map((env) => (
                        <Tag> {env} </Tag>
                      ))}
                    </div>
                  )}

                  <div className="line-block">
                    <div className="label">账号</div>
                    <Input value={item.account}></Input>
                    <Button onClick={() => UCopy.copyStr(item.account)}>
                      复制
                    </Button>
                  </div>
                  <div className="line-block">
                    <div className="label">密码</div>
                    <Input value={item.password}></Input>
                    <Button onClick={() => UCopy.copyStr(item.password)}>
                      复制
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Modal>
  );

  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(RoleAccontInfoModal);
