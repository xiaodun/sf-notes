import React, {
  forwardRef,
  ForwardRefRenderFunction,
  ReactNode,
  useImperativeHandle,
  useState,
} from 'react';
import { Modal, Button, Space } from 'antd';
import SelfStyle from './ViewContentModal.less';
import { produce } from 'immer';
import UCopy from '@/common/utils/UCopy';
export interface IViewContentModal {
  showModal: (content: string) => void;
}
export interface IViewContentModalProps {}

export interface IViewContentModalState {
  open: boolean;
  content: string;
}
const defaultState: IViewContentModalState = {
  open: false,
  content: '',
};
const ViewContentModal: ForwardRefRenderFunction<
  IViewContentModal,
  IViewContentModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<IViewContentModalState>(defaultState);
  useImperativeHandle(ref, () => ({
    showModal: (content: string) => {
      setState(
        produce(state, (drafState) => {
          drafState.open = true;
          drafState.content = content;
        }),
      );
    },
  }));

  return (
    <Modal
      width="500px"
      title="信息展示"
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
      <Space direction="vertical">
        <Button
          onClick={() => {
            UCopy.copyStr(state.content);
          }}
        >
          复制
        </Button>
        <div className={SelfStyle.contentWrap}>
          {parseContent().map((item) => item)}
        </div>
      </Space>
    </Modal>
  );

  function parseContent() {
    const linkPattern = RegExp(
      `((https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5])`,
      'g',
    );
    let result: RegExpExecArray | null,
      lastIndex = 0;
    let partList: ReactNode[] = [];
    let index = 0;
    while ((result = linkPattern.exec(state.content)) !== null) {
      if (result.index !== lastIndex) {
        const content = state.content.substring(
          lastIndex,
          result.index,
        );
        partList.push(content);
      }
      const link = result[0];
      partList.push(
        <a target="_blank" key={index} href={link}>
          {link}
        </a>,
      );
      index++;

      lastIndex = result.index + link.length;
    }
    if (lastIndex !== state.content.length) {
      partList.push(state.content.substring(lastIndex));
    }
    return partList;
  }

  function onCancel() {
    setState(defaultState);
  }
};
export default forwardRef(ViewContentModal);
