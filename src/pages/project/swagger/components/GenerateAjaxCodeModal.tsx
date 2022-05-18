import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button } from "antd";
import produce from "immer";
import SelfStyle from "./GenerateAjaxCodeModal.less";
import NProject from "../../NProject";
import SProject from "../../SProject";
import UCopy from "@/common/utils/UCopy";
import SyntaxHighlighter from "react-syntax-highlighter";
export interface IGenerateAjaxCodeModal {
  showModal: (checkPathList: NProject.IMenuCheckbox[]) => void;
}
export interface IGenerateAjaxCodeModalProps {
  projectName: string;
}
export interface IGenerateAjaxCodeModalState {
  visible: boolean;
  checkedPathList: NProject.IMenuCheckbox[];
}
const defaultState: IGenerateAjaxCodeModalState = {
  visible: false,
  checkedPathList: [],
};
const GenerateAjaxCodeModal: ForwardRefRenderFunction<
  IGenerateAjaxCodeModal,
  IGenerateAjaxCodeModalProps
> = (props, ref) => {
  const [state, setState] = useState<IGenerateAjaxCodeModalState>({
    ...defaultState,
  });
  const [ajaxCodeList, setAjaxCodeList] = useState<NProject.IAjaxCode[]>([]);
  useImperativeHandle(ref, () => ({
    showModal: (checkedPathList: NProject.IMenuCheckbox[]) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.checkedPathList = checkedPathList;
        })
      );
      reqGetAjaxCode(checkedPathList);
    },
  }));

  return (
    <Modal
      width="960px"
      title="生成ajax代码"
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
        {ajaxCodeList &&
          ajaxCodeList.map((item, index) => {
            return (
              <div key={index}>
                <div className={SelfStyle.titleWrap}>
                  <div className="title">{item.name}</div>
                  <Button onClick={() => UCopy.copyStr(item.data)}>
                    复制代码
                  </Button>
                </div>
                <div className={SelfStyle.codeWrap}>
                  <SyntaxHighlighter>{item.data}</SyntaxHighlighter>
                </div>
              </div>
            );
          })}
      </div>
    </Modal>
  );

  async function reqGetAjaxCode(checkedPathList: NProject.IMenuCheckbox[]) {
    const rsp = await SProject.getAjaxCode(props.projectName, checkedPathList);
    if (rsp.success) {
      setAjaxCodeList(rsp.list);
    }
  }

  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(GenerateAjaxCodeModal);
