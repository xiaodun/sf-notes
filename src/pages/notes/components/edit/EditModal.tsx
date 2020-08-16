import TNotes from '../../TNotes';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from 'react';
import { Modal } from 'antd';
import React from 'react';

export interface IEditModalProps {
  name: string;
}

export interface IEditModalState {
  visible: boolean;
  data: TNotes;
  added: boolean;
}
export interface IEditModalRef {
  showModal: (visible: boolean, data?: TNotes) => void;
}
const defaultState: IEditModalState = {
  added: false,
  visible: false,
  data: {
    content: '',
    loadCount: 0,
    base64: {},
    createTime: null,
    updateTime: null,
    title: '',
  },
};

export const EditModal: ForwardRefRenderFunction<
  IEditModalRef,
  IEditModalProps
> = (props, ref) => {
  const [state, setState] = useState(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: (visible, data) => {
      setState((preState) => ({
        ...preState,
        visible,
        ...(data ? { data } : { added: true }),
      }));
    },
  }));
  function oncancel() {
    setState(defaultState);
  }
  const title = state.added ? '添加记事' : '编辑记事';
  return (
    <Modal
      visible={state.visible}
      title={title}
      onCancel={oncancel}
    ></Modal>
  );
};
export default forwardRef(EditModal);
