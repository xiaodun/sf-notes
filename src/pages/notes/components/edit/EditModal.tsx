import TNotes from '../../TNotes';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useEffect,
} from 'react';
import { Modal, Input, Space } from 'antd';
import SelfStyle from './EditModal.less';
import React from 'react';
import TextArea from 'antd/lib/input/TextArea';
import { YYYY_MM_DD } from '@/common/constant/DateConstant';
import moment from 'moment';
import SNotes from '../../SNotes';
import { cloneDeep } from 'lodash';

export interface IEditModalProps {
  onAddSuccess: (notes: TNotes) => void;
  onEditSuccess: (notes: TNotes) => void;
}

export interface IEditModalState {
  visible: boolean;
  index: number;
  data: TNotes;
  added: boolean;
}
export interface IEditModalRef {
  showModal: (data?: TNotes) => void;
}
const defaultState: IEditModalState = {
  added: false,
  visible: false,
  index: 0,
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
          preState.added = false;
          preState.data = cloneDeep(data);
        } else {
          preState.added = true;
        }

        return {
          ...preState,
        };
      });
    },
  }));
  useEffect(() => {
    if (state.visible) {
      textAreaRef.current && textAreaRef.current.focus();
    }
  }, [state.visible]);
  function onDataChange(notes: Partial<TNotes>) {
    setState((preState) => {
      preState.data = { ...preState.data, ...notes } as TNotes;
      return {
        ...preState,
      };
    });
  }
  async function onOk() {
    if (state.added) {
      const res = await SNotes.addItem(state.data);
      if (res.success) {
        props.onAddSuccess(res.data);
        onCancel();
      }
    } else {
      const res = await SNotes.editItem(state.data);
      if (res.success) {
        props.onEditSuccess(res.data);
        onCancel();
      }
    }
  }
  function onCancel() {
    setState((preState) => {
      preState.visible = false;
      preState.data = defaultState.data;
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
      maskClosable={false}
      onOk={() => onOk()}
      centered
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
