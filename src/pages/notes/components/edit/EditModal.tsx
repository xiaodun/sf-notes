import TNotes from '../../TNotes';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
} from 'react';
import { Modal, Input, Space } from 'antd';
import SelfStyle from './EditModal.less';
import React from 'react';
import TextArea from 'antd/lib/input/TextArea';
import { YYYY_MM_DD } from '@/common/constant/DateConstant';
import moment from 'moment';
import SNotes from '../../SNotes';

export interface IEditModalProps {
  onSuccess: (notes: TNotes) => void;
}

export interface IEditModalState {
  visible: boolean;
  data: TNotes;
  added: boolean;
}
export interface IEditModalRef {
  showModal: (data?: TNotes) => void;
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
  const [state, setState] = useState<Partial<IEditModalState>>(
    defaultState,
  );
  const textAreaRef = useRef<TextArea>();
  useImperativeHandle(ref, () => ({
    showModal: (data) => {
      setState((preState) => {
        preState.visible = true;
        if (data) {
          preState.added = true;
        }
        return {
          ...preState,
        };
      });
    },
  }));
  function onDataChange(notes: Partial<TNotes>) {
    setState((preData) => {
      preData.data = { ...preData, ...notes } as TNotes;
      return {
        ...preData,
      };
    });
  }
  async function onOk() {
    const res = await SNotes.addItem(state.data);
    if (res.success) {
      onCancel();
      props.onSuccess(state.data);
    }
  }
  function onCancel() {
    setState((preState) => {
      preState.visible = false;
      return {
        ...preState,
      };
    });
  }
  const title = state.added ? '添加记事' : '编辑记事';
  return (
    <Modal
      visible={state.visible}
      title={title}
      onOk={() => onOk()}
      onCancel={onCancel}
    >
      <Space
        style={{ width: '100%' }}
        direction="vertical"
        size="middle"
      >
        <Input.TextArea
          value={state.data.content}
          onChange={(e) =>
            onDataChange({
              content: e.target.value,
            })
          }
          className={SelfStyle.contentContainer}
          autoSize={{
            minRows: 8,
          }}
          autoFocus
          ref={textAreaRef}
          placeholder={`支持普通链接\n图片链接\n黏贴图片\n拖拽桌面图片\n\`\`\`\n格式代码\n\`\`\`\n`}
        ></Input.TextArea>
        <Input
          value={state.data.title}
          onChange={(e) =>
            onDataChange({
              title: e.target.value,
            })
          }
          placeholder={`标题 默认为${moment().format(YYYY_MM_DD)}`}
        ></Input>
      </Space>
    </Modal>
  );
};
export default forwardRef(EditModal);
