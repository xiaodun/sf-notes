import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Tabs, Form, Input } from "antd";
import SelfStyle from "./ShowSystemInfoModal.less";
import produce from "immer";
import { NMDIterative } from "umi";
import UCopy from "@/common/utils/UCopy";
export interface IShowSystemInfoModalModal {
  showModal: () => void;
}
export interface IShowSystemInfoModalModalProps {
  MDIterative: NMDIterative.IState;
}

export interface IShowSystemInfoModalModalState {
  visible: boolean;
}
const defaultState: IShowSystemInfoModalModalState = {
  visible: false,
};
const ShowSystemInfoModalModal: ForwardRefRenderFunction<
  IShowSystemInfoModalModal,
  IShowSystemInfoModalModalProps
> = (props, ref) => {
  const { MDIterative } = props;
  const [state, setState] =
    useState<IShowSystemInfoModalModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
        })
      );
    },
  }));

  return (
    <Modal
      width="700px"
      title="系统信息"
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
      <Tabs tabPosition="left">
        {MDIterative.systemTagList
          .filter((systemTag) => systemTag.url)
          .map((systemTag) => (
            <Tabs.TabPane tab={systemTag.label} key={systemTag.label}>
              {systemTag.moreEnv ? (
                <>
                  {MDIterative.envTagList.map((envTag) => (
                    <div className={SelfStyle.addressWrap} key={envTag.value}>
                      <div className="label">{envTag.label}</div>
                      <Input value={systemTag.address[envTag.value]}></Input>
                      <Button
                        className="copy-btn"
                        onClick={() =>
                          UCopy.copyStr(systemTag.address[envTag.value])
                        }
                      >
                        复制
                      </Button>
                      <Button className="jump-btn">
                        <a
                          href={systemTag.address[envTag.value]}
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

  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(ShowSystemInfoModalModal);
