import NJokes from "../NJokes";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
} from "react";
import { Modal, Input, Space, message } from "antd";
import React from "react";
import moment from "moment";
import SJokes from "../SJokes";
import { produce } from "immer";
import UDate from "@/common/utils/UDate";
import NRsp from "@/common/namespace/NRsp";
import { TextAreaRef } from "antd/lib/input/TextArea";
import { USelection } from "@/common/utils/USelection";

export interface IEditModalProps {
  rsp: NRsp<NJokes>;
  onOk: () => void;
}

export interface IEditModalState {
  open: boolean;
  index: number;
  data: NJokes;
  added: boolean;
}
export interface IEditModal {
  showModal: (data?: NJokes, index?: number) => void;
}
const defaultState: IEditModalState = {
  added: false,
  open: false,
  index: 0,
  data: {
    upperContent: "",
    lowerContent: "",
    base64: {},
    createTime: null,
    updateTime: null,
  },
};

export const EditModal: ForwardRefRenderFunction<
  IEditModal,
  IEditModalProps
> = (props, ref) => {
  const [state, setState] = useState<Partial<IEditModalState>>(defaultState);
  const textAreaRef = useRef<TextAreaRef>();
  const loadCountRef = useRef<number>(0);

  useImperativeHandle(ref, () => ({
    showModal: (data, index) => {
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        drafState.index = index;
        if (data) {
          drafState.added = false;
          // 兼容旧数据：如果有 content 但没有 upperContent，将 content 迁移到 upperContent
          const jokeData = { ...data };
          if (!jokeData.upperContent && (jokeData as any).content) {
            jokeData.upperContent = (jokeData as any).content;
          }
          if (!jokeData.upperContent) {
            jokeData.upperContent = "";
          }
          if (!jokeData.lowerContent) {
            jokeData.lowerContent = "";
          }
          if (!jokeData.base64) {
            jokeData.base64 = {};
          }
          drafState.data = jokeData;
        } else {
          drafState.added = true;
          drafState.data = {
            upperContent: "",
            lowerContent: "",
            base64: {},
            createTime: null,
            updateTime: null,
          };
        }
      });

      setState(newState);
      setTimeout(() => {
        textAreaRef.current.focus();
      }, 20);
    },
  }));

  const title = state.added ? "添加" : "修改";
  return (
    <Modal
      open={state.open}
      title={title}
      maskClosable={false}
      onOk={onOk}
      centered
      onCancel={onClose}
      okButtonProps={{
        loading: loadCountRef.current > 0,
      }}
      width={600}
    >
      <Space style={{ width: "100%" }} direction="vertical" size="middle">
        <div
          onDragOver={onDragOver}
          onDrop={onDrop}
          style={{ position: "relative" }}
        >
          <div style={{ marginBottom: 8, fontWeight: 500 }}>上段内容：</div>
          <Input.TextArea
            value={state.data.upperContent}
            autoSize={{
              minRows: 6,
            }}
            ref={textAreaRef}
            placeholder="请输入上段内容，支持拖拽或粘贴图片"
            onKeyUp={onContentKeyUp}
            onPaste={onPaste}
            onChange={(e) =>
              onDataChange({
                upperContent: e.target.value,
              })
            }
          />
        </div>
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>
            下段内容（可选）：
          </div>
          <Input.TextArea
            value={state.data.lowerContent || ""}
            autoSize={{
              minRows: 6,
            }}
            placeholder="请输入下段内容（可选）"
            onChange={(e) =>
              onDataChange({
                lowerContent: e.target.value,
              })
            }
          />
        </div>
      </Space>
    </Modal>
  );
  function onContentKeyUp(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.ctrlKey && event.key === "Enter") {
      onOk();
    }
  }
  function onDataChange(joke: Partial<NJokes>) {
    const newState = produce(state, (drafState) => {
      Object.assign(drafState.data, joke);
    });
    setState(newState);
  }
  async function onOk() {
    if (!state.data.upperContent?.trim()) {
      message.warning("请输入上段内容");
      return;
    }
    if (state.added) {
      const params = { ...state.data };
      // 新添加的放在第一个位置（index: 0）
      const addRsp = await SJokes.addItem(params, 0);
      if (addRsp.success) {
        message.success("添加成功");
        onClose();
        props.onOk();
      }
    } else {
      const editRsp = await SJokes.editItem(state.data);
      if (editRsp.success) {
        message.success("修改成功");
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
      dataTransfer.dropEffect = "copy";
    }
  }
  function onDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const dataTransfer = event.dataTransfer;
    const joke: Partial<NJokes> = {
      base64: { ...state.data.base64 },
      upperContent: state.data.upperContent,
    };

    if (dataTransfer.types.includes("Files")) {
      for (let i = 0; i < dataTransfer.files.length; i++) {
        const file = dataTransfer.files[i];
        loadCountRef.current++;
        convertFile(file, joke);
      }
    }
  }
  function convertFile(file: File, joke: Partial<NJokes>) {
    const { type } = file;
    if (type.includes("image")) {
      convertImgFile(file, joke);
    } else {
      message.warning("只支持图片文件!");
      loadCountRef.current--;
    }
  }
  function convertImgFile(file: File, joke: Partial<NJokes>) {
    let reader = new FileReader();

    reader.onload = function (event) {
      //转换为自定义图片
      let fileName =
        NJokes.imgProtocolKey +
        "://" +
        ((Math.random() * 1000000) | 0) +
        "." +
        file.type.split("/")[1];
      loadCountRef.current--;
      if (!joke.base64) {
        joke.base64 = {};
      }
      joke.base64[fileName] = event.target.result;
      const curPos = USelection.getCursorPos();
      let addedPos = curPos;
      if (curPos > 0 && joke.upperContent[curPos - 1] !== "\n") {
        fileName = "\n" + fileName;
        addedPos += 1;
      }
      addedPos += fileName.length;
      if (joke.upperContent[curPos] !== "\n" && joke.upperContent[curPos]) {
        fileName += "\n";
      }
      joke.upperContent =
        joke.upperContent.substring(0, curPos) +
        fileName +
        joke.upperContent.substring(curPos);
      if (loadCountRef.current == 0) {
        const newState = produce(state, (drafState) => {
          Object.assign(drafState.data, joke);
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
    var clipboardItems = event.clipboardData && event.clipboardData.items;
    const joke: Partial<NJokes> = {
      base64: { ...state.data.base64 },
      upperContent: state.data.upperContent,
    };
    if (clipboardItems && clipboardItems.length) {
      for (let i = 0; i < clipboardItems.length; i++) {
        if (
          clipboardItems[i].kind === "file" &&
          clipboardItems[i].type.indexOf("image") !== -1
        ) {
          const file = clipboardItems[i].getAsFile();
          loadCountRef.current++;
          convertFile(file, joke);
          break;
        }
      }
    }
  }
};
export default forwardRef(EditModal);
