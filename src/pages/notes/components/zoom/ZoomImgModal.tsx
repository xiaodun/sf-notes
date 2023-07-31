import React, {
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from "react";
import { Modal, Button } from "antd";
import { produce } from "immer";
export interface IZoomImgModal {
  showModal: (src: string) => void;
}
export interface IZoomImgModalState {
  visible: boolean;
  src: string;
}
const defaultState: IZoomImgModalState = {
  visible: false,
  src: null,
};
const ZoomImgModal: ForwardRefRenderFunction<IZoomImgModal> = (props, ref) => {
  const [state, setState] = useState<IZoomImgModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: (src: string) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.src = src;
        })
      );
    },
  }));
  function onCancel() {
    setState(
      produce(state, (drafState) => {
        drafState.visible = false;
      })
    );
  }
  return (
    <Modal
      width="100%"
      title="放大图片"
      bodyStyle={{ maxHeight: "100%", textAlign: "center" }}
      visible={state.visible}
      footer={
        <Button type="primary" onClick={onCancel}>
          关闭
        </Button>
      }
      onCancel={onCancel}
      centered
    >
      <img src={state.src} style={{ maxWidth: "100%" }} alt="" />
    </Modal>
  );
};
export default forwardRef(ZoomImgModal);
