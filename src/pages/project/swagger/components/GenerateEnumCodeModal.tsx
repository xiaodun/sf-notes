import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button, Form, Input, Tabs, message } from "antd";
import produce from "immer";
import SelfStyle from "./GenerateEnumCodeModal.less";
import SProject from "../../SProject";
import UCopy from "@/common/utils/UCopy";
import SyntaxHighlighter from "react-syntax-highlighter";
export interface IGenerateEnumCodeModal {
  showModal: (enumList: string[], values?: Object) => void;
}
export interface IGenerateEnumCodeModalProps {}
export interface IGenerateEnumCodeModalState {
  visible: boolean;
}
const defaultState: IGenerateEnumCodeModalState = {
  visible: false,
};
const GenerateEnumCodeModal: ForwardRefRenderFunction<
  IGenerateEnumCodeModal,
  IGenerateEnumCodeModalProps
> = (props, ref) => {
  const [state, setState] = useState<IGenerateEnumCodeModalState>({
    ...defaultState,
  });
  const [codeInfos, setCodeinfos] = useState<Object>({});
  useImperativeHandle(ref, () => ({
    showModal: (enumList: string[], values?: Object) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          reqGetEnumCode(enumList, values);
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
                  <SyntaxHighlighter>{codeInfos[key]}</SyntaxHighlighter>
                </div>
              </Tabs.TabPane>
            );
          })}
        </Tabs>
      </div>
    </Modal>
  );
  async function reqGetEnumCode(enumList: string[], values?: Object) {
    const rsp = await SProject.getEnumCode(enumList, values);
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
