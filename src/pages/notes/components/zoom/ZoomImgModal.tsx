import React, {
  FC,
  forwardRef,
  ForwardRefRenderFunction,
  useImperativeHandle,
  useState,
} from 'react';
import Modal from 'antd/lib/modal/Modal';
import produce from 'immer';
export interface IZoomImgModalRef {
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
const ZoomImgModal: ForwardRefRenderFunction<IZoomImgModalRef> = (
  props,
  ref,
) => {
  const [state, setState] = useState<IZoomImgModalState>(
    defaultState,
  );
  useImperativeHandle(ref, () => ({
    showModal: (src: string) => {
      setState(
        produce(state, (drafState) => {
          drafState.visible = true;
          drafState.src = src;
        }),
      );
    },
  }));
  function onCancel() {
    setState(
      produce(state, (drafState) => {
        drafState.visible = false;
      }),
    );
  }
  return (
    <Modal
      width="100%"
      title="放大图片"
      bodyStyle={{ maxHeight: '100%' }}
      visible={state.visible}
      onCancel={onCancel}
      centered
    >
      <img width="100%" src={state.src} alt="" />
    </Modal>
  );
};
export default forwardRef(ZoomImgModal);
