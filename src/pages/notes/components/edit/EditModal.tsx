import NNotes from '../../NNotes';
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useEffect,
} from 'react';
import {
  Modal,
  Input,
  Space,
  message,
  AutoComplete,
  Radio,
  Slider,
  Button,
} from 'antd';
import SelfStyle from './EditModal.less';
import React from 'react';
import moment from 'moment';
import SNotes from '../../SNotes';
import { produce } from 'immer';
import UDate from '@/common/utils/UDate';
import NRsp from '@/common/namespace/NRsp';
import { USelection } from '@/common/utils/USelection';
import { TextAreaRef } from 'antd/lib/input/TextArea';
import { RefSelectProps } from 'antd/lib/select';

export interface IEditModalProps {
  rsp: NRsp<NNotes>;
  onOk: () => void;
}

export interface IEditModalState {
  open: boolean;
  index: number;
  data: NNotes;
  added: boolean;
}
export interface IEditModal {
  showModal: (data?: NNotes, index?: number) => void;
}
const defaultState: IEditModalState = {
  added: false,
  open: false,
  index: 0,
  data: {
    content: '',
    base64: {},
    createTime: null,
    updateTime: null,
    title: '',
    titleColor: '',
    fontSize: NNotes.fontSizeDefault,
  },
};

/**
 * 笔记展示区(Welcome 里的 Layout.Content)的实际宽度。
 * 弹窗与正文展示同宽,这里直接量真实宽度,避免把 Welcome.less 里
 * width:85% / max-width:960px 这组布局参数再抄一份出来。
 */
function getNotesContentWidth(): number | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }
  const contentEl = document.querySelector('.ant-layout-content');
  const width = contentEl?.getBoundingClientRect().width;
  if (!width || width <= 0) {
    return undefined;
  }
  return Math.round(width);
}

export const EditModal: ForwardRefRenderFunction<
  IEditModal,
  IEditModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<Partial<IEditModalState>>(defaultState);
  /** 弹窗宽度,取笔记展示区宽度,拿不到时交给 antd 默认宽度 */
  const [contentWidth, setContentWidth] = useState<number>();
  /**
   * 可视视口高度。手机软键盘弹出时 visualViewport 会随之收缩,
   * 弹窗按它定高才能整体待在键盘上方;100vh 在移动端不随键盘变化,
   * 按它居中的弹窗下半截会被键盘盖住,正文只剩一条可见。
   */
  const [viewportHeight, setViewportHeight] = useState<number>();
  const isMobileLayout =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(pointer: coarse)').matches;
  const textAreaRef = useRef<TextAreaRef>();
  const autoCompleteRef = useRef<RefSelectProps>();
  const focusTargetRef = useRef<'title' | 'content'>('content');
  const loadCountRef = useRef<number>(0);
  const noteTitleId = 'noteTitleId';
  const noteEditId = 'noteEditId';
  const titleOptions = props.rsp.list
    .map((item) => ({
      value: item.title,
    }))
    .filter((item) => item.value);
  useImperativeHandle(ref, () => ({
    showModal: (data, index) => {
      //打开时量一次,和下面的 setState 一起批处理,避免先闪一下默认宽度
      setContentWidth(getNotesContentWidth());
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        drafState.index = index;
        if (data) {
          drafState.added = false;
          //老数据可能没有字号,统一补齐成合法值,滑块才有确定取值
          drafState.data = {
            ...data,
            fontSize: NNotes.resolveFontSize(data.fontSize),
          };
          focusTargetRef.current = 'content';
        } else {
          drafState.added = true;
          drafState.data = {
            ...defaultState.data,
            fontSize: NNotes.fontSizeDefault,
          };
          focusTargetRef.current = 'content';
        }
      });

      setState(newState);
    },
  }));
  useEffect(() => {
    if (!state.open) {
      return;
    }
    const timer = window.setTimeout(() => {
      if (focusTargetRef.current === 'content') {
        textAreaRef.current?.focus();
        const textArea = document.getElementById(noteEditId) as HTMLTextAreaElement;
        textArea?.focus();
        return;
      }
      autoCompleteRef.current?.focus();
      const titleInput = document.getElementById(noteTitleId) as HTMLInputElement;
      titleInput?.focus();
    }, 120);
    return () => {
      window.clearTimeout(timer);
    };
  }, [state.open, state.added]);
  useEffect(() => {
    if (!state.open) {
      return undefined;
    }
    //窗口尺寸变化时展示区宽度会变(85% 视口),弹窗跟着重新量
    const syncContentWidth = () => setContentWidth(getNotesContentWidth());
    window.addEventListener('resize', syncContentWidth);
    return () => {
      window.removeEventListener('resize', syncContentWidth);
    };
  }, [state.open]);
  useEffect(() => {
    if (!state.open || !isMobileLayout) {
      return undefined;
    }
    const viewport = window.visualViewport;
    if (!viewport) {
      return undefined;
    }
    const syncViewportHeight = () => setViewportHeight(viewport.height);
    syncViewportHeight();
    viewport.addEventListener('resize', syncViewportHeight);
    return () => {
      viewport.removeEventListener('resize', syncViewportHeight);
    };
  }, [state.open, isMobileLayout]);

  const title = state.added ? '添加记事' : '编辑记事';
  const titlePlaceholder = `标题 默认为${moment().format(
    UDate.ymdhms,
  )}`;
  const fontSize = NNotes.resolveFontSize(state.data.fontSize);
  /** 键盘弹出(可视视口被压得很小)时,藏掉辅助行,把空间全部让给正文 */
  const keyboardVisible =
    isMobileLayout &&
    viewportHeight !== undefined &&
    viewportHeight < 500;
  return (
    <Modal
      open={state.open}
      title={title}
      width={contentWidth}
      maskClosable={false}
      onOk={onOk}
      /* 移动端改为顶部对齐:居中定位按整屏算,键盘弹出后下半截会被盖住 */
      centered={!isMobileLayout}
      style={isMobileLayout ? { top: 4, paddingBottom: 0 } : undefined}
      onCancel={onClose}
      okButtonProps={{
        loading: loadCountRef.current > 0,
      }}
      bodyStyle={
        isMobileLayout && viewportHeight
          ? {
              //按可视视口定高(减去标题栏/底部按钮的余量),键盘弹出时随之收缩
              height: Math.max(viewportHeight - 132, 140),
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }
          : {
              //弹窗整体不超高,多出来的高度给正文文本框,由它内部滚动
              height: 'calc(100vh - 170px)',
              maxHeight: '72vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }
      }
    >
      <Space
        className={SelfStyle.bodyContent}
        style={{ width: '100%' }}
        direction="vertical"
        size="middle"
      >
        {!keyboardVisible && (
          <Radio.Group
            onChange={(event) =>
              onDataChange({
                titleColor: event.target.value,
              })
            }
            value={state.data.titleColor}
          >
            <Radio value="">默认</Radio>
            <Radio value="#e41749">红色</Radio>
            <Radio value="#08ffc8">绿色</Radio>
          </Radio.Group>
        )}
        {!keyboardVisible &&
          (state.added ? (
            <AutoComplete
              ref={autoCompleteRef}
              id={noteTitleId}
              options={titleOptions}
              style={{ width: '100%' }}
              value={state.data.title}
              onSelect={onSelectTitle}
              onSearch={onSelectExistTitle}
              onBlur={onBlurTitle}
              onChange={(title) =>
                onDataChange({
                  title,
                })
              }
              placeholder={titlePlaceholder}
            ></AutoComplete>
          ) : (
            <Input
              id={noteTitleId}
              value={state.data.title}
              onChange={(e) =>
                onDataChange({
                  title: e.target.value,
                })
              }
              placeholder={titlePlaceholder}
            ></Input>
          ))}
        {!keyboardVisible && (
          <div className={SelfStyle.fontSizeRow}>
            <span className={SelfStyle.fontSizeLabel}>正文字号</span>
            <Slider
              className={SelfStyle.fontSizeSlider}
              min={NNotes.fontSizeMin}
              max={NNotes.fontSizeMax}
              step={NNotes.fontSizeStep}
              value={fontSize}
              onChange={(value: number) =>
                onDataChange({
                  fontSize: value,
                })
              }
            />
            <span className={SelfStyle.fontSizeValue}>{fontSize}px</span>
          </div>
        )}
        <div
          className={SelfStyle.contentWrapper}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className={SelfStyle.toolbarRow}>
            <Button onClick={onPasteClipboard}>粘贴到末尾</Button>
          </div>
          <Input.TextArea
            id={noteEditId}
            value={state.data.content}
            className={SelfStyle.contentContainer}
            style={{ fontSize, lineHeight: 1.6 }}
            onPaste={onPaste}
            ref={textAreaRef}
            placeholder={`支持普通链接\n图片链接\n黏贴图片\n拖拽桌面图片\n\`\`\`\n格式代码\n\`\`\`\n`}
            onKeyUp={onContentKeyUp}
            onChange={(e) =>
              onDataChange({
                content: e.target.value,
              })
            }
          ></Input.TextArea>
        </div>
      </Space>
    </Modal>
  );
  function onContentKeyUp(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.ctrlKey && event.key === 'Enter') {
      onOk();
    }
  }
  function onBlurTitle() {
    const notes = props.rsp.list.find(
      (item) => item.title == state.data.title,
    );
    if (notes) {
      if (!state.data.content) {
        //如果没值才覆盖
        onDataChange({
          content: notes.content,
        });
      }
    }
  }
  function onSelectExistTitle(title: string) {
    return titleOptions.filter(
      (item) => item.value.indexOf(title) !== -1,
    );
  }
  function onSelectTitle(title: string) {
    const notes =
      props.rsp.list.find((item) => item.title == title) || {};
    if (!state.data.content) {
      onDataChange({
        title,
        ...notes,
      });
    }
  }
  function onDataChange(notes: Partial<NNotes>) {
    const newState = produce(state, (drafState) => {
      Object.assign(drafState.data, notes);
    });
    setState(newState);
  }
  async function onOk() {
    if (state.added) {
      const params = { ...state.data };
      if (!state.data.title) {
        params.title = moment().format(UDate.ymdhms);
      }
      const addRsp = await SNotes.addItem(params, state.index);
      if (addRsp.success) {
        onClose();
        props.onOk();
      }
    } else {
      const editRsp = await SNotes.editItem(state.data);
      if (editRsp.success) {
        onClose();
        props.onOk();
      }
    }
  }
  function onClose() {
    setState({ ...defaultState });
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
    const notes: Partial<NNotes> = {
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
  function convertFile(file: File, notes: Partial<NNotes>) {
    const { type } = file;
    if (type.includes('image')) {
      convertImgFile(file, notes);
    } else {
      message.warning('只支持图片文件!');
    }
  }
  function convertImgFile(file: File, notes: Partial<NNotes>) {
    let reader = new FileReader();

    reader.onload = function (event) {
      //转换为自定义图片
      let fileName =
        NNotes.imgProtocolKey +
        '://' +
        ((Math.random() * 1000000) | 0) +
        '.' +
        file.type.split('/')[1];
      loadCountRef.current--;
      notes.base64[fileName] = event.target.result;
      const curPos = USelection.getCursorPos();
      let addedPos = curPos;
      if (curPos > 0 && notes.content[curPos - 1] !== '\n') {
        fileName = '\n' + fileName;
        addedPos + 1;
      }
      addedPos += fileName.length;
      if (notes.content[curPos + 1] !== '\n') {
        fileName += '\n';
      }
      notes.content =
        notes.content.substring(0, curPos) +
        fileName +
        notes.content.substring(curPos + 1);
      if (loadCountRef.current == 0) {
        const newState = produce(state, (drafState) => {
          Object.assign(drafState.data, notes);
        });
        setState(newState);
        setTimeout(() => {
          USelection.setCursorPos(addedPos);
        }, 20);
      }
    };
    reader.readAsDataURL(file);
  }
  function onPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    var clipboardItems =
      event.clipboardData && event.clipboardData.items;
    const notes: Partial<NNotes> = {
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
  /**
   * 移动端键盘弹出后可编辑区被压缩,长按输入框操作剪贴板很费劲,
   * 由按钮主动读剪贴板并追加到正文末尾,不依赖光标定位。
   * clipboard.read 只在安全上下文(HTTPS/localhost)可用,且需点击手势触发;
   * WebView 壳浏览器(如 Zen)没有权限弹窗、read 一律拒绝,
   * 这种环境走宿主注入的 ZenClipboard 桥(读系统剪贴板,带 host 级确认)。
   */
  async function onPasteClipboard() {
    const zenClipboard = (window as any).ZenClipboard;
    if (zenClipboard && typeof zenClipboard.read === 'function') {
      (window as any).__onZenClipboard = (text: string | null) => {
        if (text) {
          appendText(text);
        } else {
          message.warning('未能读取剪贴板(可能为空或已拒绝)');
        }
      };
      zenClipboard.read('__onZenClipboard');
      return;
    }
    if (!navigator.clipboard || !navigator.clipboard.read) {
      message.warning('当前环境不支持读取剪贴板,请通过 HTTPS 访问');
      return;
    }
    let items: ClipboardItem[];
    try {
      items = await navigator.clipboard.read();
    } catch (error) {
      message.error('读取剪贴板失败,请允许粘贴权限后重试');
      return;
    }
    for (const item of items) {
      const imageType = item.types.find(
        (type) => type.indexOf('image/') === 0,
      );
      if (imageType) {
        const blob = await item.getType(imageType);
        appendImgFile(
          new File([blob], `clipboard.${imageType.split('/')[1]}`, {
            type: imageType,
          }),
        );
        return;
      }
    }
    for (const item of items) {
      if (item.types.indexOf('text/plain') !== -1) {
        const blob = await item.getType('text/plain');
        appendText(await blob.text());
        return;
      }
    }
    message.warning('剪贴板里没有可粘贴的内容');
  }
  function appendText(text: string) {
    if (!text.trim()) {
      message.warning('剪贴板里没有可粘贴的内容');
      return;
    }
    //用函数式更新拿最新 state,读取剪贴板期间(权限弹窗)用户可能仍在输入
    setState((prevState) =>
      produce(prevState, (drafState) => {
        drafState.data.content = joinLine(drafState.data.content, text);
      }),
    );
    message.success('已追加到末尾');
    scrollContentToEnd();
  }
  function appendImgFile(file: File) {
    loadCountRef.current++;
    const reader = new FileReader();
    reader.onload = function (event) {
      //与粘贴/拖拽共用 imgProtocolKey 协议
      const fileName =
        NNotes.imgProtocolKey +
        '://' +
        ((Math.random() * 1000000) | 0) +
        '.' +
        file.type.split('/')[1];
      loadCountRef.current--;
      setState((prevState) =>
        produce(prevState, (drafState) => {
          drafState.data.base64[fileName] = event.target.result;
          drafState.data.content = joinLine(
            drafState.data.content,
            fileName,
          );
        }),
      );
      message.success('已追加到末尾');
      scrollContentToEnd();
    };
    reader.readAsDataURL(file);
  }
  /** 追加前保证旧内容以换行结尾,新内容才不会黏在最后一行 */
  function joinLine(content: string, addition: string) {
    if (!content) {
      return addition;
    }
    return content + (content.endsWith('\n') ? '' : '\n') + addition;
  }
  function scrollContentToEnd() {
    //等 setState 渲染完再滚,才能滚到追加后的末尾
    window.setTimeout(() => {
      const textArea = document.getElementById(
        noteEditId,
      ) as HTMLTextAreaElement;
      if (textArea) {
        textArea.scrollTop = textArea.scrollHeight;
      }
    }, 20);
  }
};
export default forwardRef(EditModal);
