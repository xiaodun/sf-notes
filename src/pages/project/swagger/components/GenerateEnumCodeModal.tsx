import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Form, Input, Tabs, message } from "antd";
import produce from "immer";
import SelfStyle from "./GenerateEnumCodeModal.less";
import NProject from "../../NProject";
import SProject from "../../SProject";
import UCopy from "@/common/utils/UCopy";
export interface IGenerateEnumCodeModal {
  showModal: (enumList: string[]) => void;
}
export interface IEnterSwaggerProps {}
export interface IGenerateEnumCodeModalState {
  visible: boolean;
}
const defaultState: IGenerateEnumCodeModalState = {
  visible: false,
};
const GenerateEnumCodeModal: ForwardRefRenderFunction<
  IGenerateEnumCodeModal,
  IEnterSwaggerProps
> = (props, ref) => {
  const [state, setState] = useState<IGenerateEnumCodeModalState>({
    ...defaultState,
  });
  const [codeInfos, setCodeinfos] = useState<Object>({});
  useImperativeHandle(ref, () => ({
    showModal: (enumList: string[]) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          reqGetEnumCode(enumList);
        })
      );
    },
  }));

  return (
    <Modal
      width="960px"
      title="生成枚举代码"
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
      <div className={SelfStyle.main}>
        <Tabs tabPosition="left">
          {Object.keys(codeInfos).map((key) => {
            return (
              <Tabs.TabPane tab={key} key={key}>
                <div className={SelfStyle.topWrap}>
                  <Button onClick={() => UCopy.copyStr(codeInfos[key])}>
                    复制代码
                  </Button>
                </div>
                <div className={SelfStyle.codeWrap}>
                  <pre>{codeInfos[key]}</pre>
                </div>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    </Modal>
  );
  async function reqGetEnumCode(enumList: string[]) {
    const rsp = await SProject.getEnumCode(enumList);
    if (rsp.success) {
      setCodeinfos(rsp.data);
    }
  }
  function onCancel() {
    setState(defaultState);
    setCodeinfos({});
  }
};
export default forwardRef(GenerateEnumCodeModal);
