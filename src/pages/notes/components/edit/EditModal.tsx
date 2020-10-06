import TNotes from '../../TNotes';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useEffect,
} from 'react';
import { Modal, Input, Space, message } from 'antd';
import SelfStyle from './EditModal.less';
import React from 'react';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import SNotes from '../../SNotes';
import produce from 'immer';
import UDate from '@/common/utils/UDate';
import UNotes from '../../UNotes';

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
  const loadCountRef = useRef<number>(0);
  useImperativeHandle(ref, () => ({
    showModal: (data) => {
      const newState = produce(state, (drafState) => {
        drafState.visible = true;
        if (data) {
          drafState.added = false;
          drafState.data = data;
        } else {
          drafState.added = true;
        }
      });
      setState(newState);
    },
  }));
  useEffect(() => {
    if (state.visible) {
      textAreaRef.current && textAreaRef.current.focus();
    }
  }, [state.visible]);
  function onDataChange(notes: Partial<TNotes>) {
    const newState = produce(state, (drafState) => {
      Object.assign(drafState.data, notes);
    });
    setState(newState);
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
    setState(defaultState);
  }
  function onDragOver(event: React.DragEvent<HTMLDivElement>) {
    const dataTransfer = event.dataTransfer;
    event.stopPropagation();
    event.preventDefault();
    if (dataTransfer) {
      dataTransfer.dropEffect = 'copy';
    }
  }
  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const dataTransfer = event.dataTransfer;
    const notes: Partial<TNotes> = {
      base64: { ...state.data.base64 },
      content: state.data.content,
    };

    if (dataTransfer.types.includes('Files')) {
      for (let i = 0; i < dataTransfer.files.length; i++) {
        const file = dataTransfer.files[i];
        loadCountRef.current++;

        convertFile(file, notes);
      }
    }
  }
  function convertFile(file: File, notes: Partial<TNotes>) {
    const { type } = file;
    if (type.includes('image')) {
      convertImgFile(file, notes);
    } else {
      message.warning('只支持图片文件!');
    }
  }
  function convertImgFile(file: File, notes: Partial<TNotes>) {
    let reader = new FileReader();

    reader.onload = function (event) {
      //转换为自定义图片
      let fileName =
        UNotes.imgProtocolKey +
        '://' +
        ((Math.random() * 1000000) | 0) +
        '.' +
        file.type.split('/')[1];
      loadCountRef.current--;
      notes.base64[fileName] = event.target.result;
      notes.content += '\n' + fileName + '\n';
      if (loadCountRef.current == 0) {
        const newState = produce(state, (drafState) => {
          Object.assign(drafState.data, notes);
        });
        setState(newState);
      }
    };
    reader.readAsDataURL(file);
  }
  function onPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    var clipboardItems =
      event.clipboardData && event.clipboardData.items;
    const notes: Partial<TNotes> = {
      base64: { ...state.data.base64 },
      content: state.data.content,
    };
    if (clipboardItems && clipboardItems.length) {
      for (let i = 0; i < clipboardItems.length; i++) {
        if (
          clipboardItems[i].kind === 'file' &&
          clipboardItems[i].type.indexOf('image') !== -1
        ) {
          /**
           * 确认为一个图片类型 只靠type或kind不行
            有道黏贴可能会出现  kind: "string", type: "text/yne-image-json"
           */
          const file = clipboardItems[i].getAsFile();
          loadCountRef.current++;
          convertFile(file, notes);
          break;
        }
      }
    }
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
      okButtonProps={{
        loading: loadCountRef.current > 0,
      }}
    >
      <Space
        style={{ width: '100%' }}
        direction="vertical"
        size="middle"
      >
        <div onDragOver={onDragOver} onDrop={onDrop}>
          <Input.TextArea
            value={state.data.content}
            className={SelfStyle.contentContainer}
            autoSize={{
              minRows: 8,
            }}
            onPaste={onPaste}
            autoFocus
            ref={textAreaRef}
            placeholder={`支持普通链接\n图片链接\n黏贴图片\n拖拽桌面图片\n\`\`\`\n格式代码\n\`\`\`\n`}
            onChange={(e) =>
              onDataChange({
                content: e.target.value,
              })
            }
          ></Input.TextArea>
        </div>
        <Input
          value={state.data.title}
          onChange={(e) =>
            onDataChange({
              title: e.target.value,
            })
          }
          placeholder={`标题 默认为${moment().format(
            UDate.YYYY_MM_DD,
          )}`}
        ></Input>
      </Space>
    </Modal>
  );
};
export default forwardRef(EditModal);
