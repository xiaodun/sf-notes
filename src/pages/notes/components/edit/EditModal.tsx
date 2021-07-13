import NNotes from "../../NNotes";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
  useEffect,
} from "react";
import { Modal, Input, Space, message, AutoComplete } from "antd";
import SelfStyle from "./EditModal.less";
import React from "react";
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";
import SNotes from "../../SNotes";
import produce from "immer";
import UDate from "@/common/utils/UDate";
import NModel from "@/common/namespace/NModel";
import { NMDNotes } from "umi";
import NRsp from "@/common/namespace/NRsp";
import { USelection } from "@/common/utils/USelection";

export interface IEditModalProps {
  rsp: NRsp<NNotes>;
}

export interface IEditModalState {
  visible: boolean;
  index: number;
  data: NNotes;
  added: boolean;
}
export interface IEditModal {
  showModal: (data?: NNotes, index?: number) => void;
}
const defaultState: IEditModalState = {
  added: false,
  visible: false,
  index: 0,
  data: {
    content: "",
    base64: {},
    createTime: null,
    updateTime: null,
    title: "",
  },
};

export const EditModal: ForwardRefRenderFunction<
  IEditModal,
  IEditModalProps
> = (props, ref) => {
  const [state, setState] = useState<Partial<IEditModalState>>(defaultState);
  const textAreaRef = useRef<TextArea>();
  const loadCountRef = useRef<number>(0);
  const noteTitleId = "noteTitleId";
  const titleOptions = props.rsp.list
    .map((item) => ({
      value: item.title,
    }))
    .filter((item) => item.value);
  useImperativeHandle(ref, () => ({
    showModal: (data, index) => {
      const newState = produce(state, (drafState) => {
        drafState.visible = true;
        drafState.index = index;
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
      setTimeout(() => {
        USelection.end(
          document.getElementById(noteTitleId) as HTMLTextAreaElement
        );
      });
    }
  }, [state.visible]);

  const title = state.added ? "添加记事" : "编辑记事";
  const titlePlaceholder = `标题 默认为${moment().format(UDate.ymd)}`;
  return (
    <Modal
      visible={state.visible}
      title={title}
      maskClosable={false}
      onOk={() => onOk()}
      centered
      onCancel={onClose}
      okButtonProps={{
        loading: loadCountRef.current > 0,
      }}
    >
      <Space style={{ width: "100%" }} direction="vertical" size="middle">
        {state.added ? (
          <AutoComplete
            id={noteTitleId}
            options={titleOptions}
            style={{ width: "100%" }}
            value={state.data.title}
            onSelect={onSelectTitle}
            onSearch={onSelectExistTitle}
            autoFocus
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
            autoFocus
            onChange={(e) =>
              onDataChange({
                title: e.target.value,
              })
            }
            placeholder={titlePlaceholder}
          ></Input>
        )}
        <div onDragOver={onDragOver} onDrop={onDrop}>
          <Input.TextArea
            value={state.data.content}
            className={SelfStyle.contentContainer}
            autoSize={{
              minRows: 8,
            }}
            onPaste={onPaste}
            ref={textAreaRef}
            placeholder={`支持普通链接\n图片链接\n黏贴图片\n拖拽桌面图片\n\`\`\`\n格式代码\n\`\`\`\n`}
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
  function onBlurTitle() {
    const notes = props.rsp.list.find((item) => item.title == state.data.title);
    if (notes) {
      onDataChange({
        content: notes.content,
      });
    } else {
      onDataChange({
        content: "",
      });
    }
  }
  function onSelectExistTitle(title: string) {
    return titleOptions.filter((item) => item.value.indexOf(title) !== -1);
  }
  function onSelectTitle(title: string) {
    const notes = props.rsp.list.find((item) => item.title == title);
    onDataChange({
      title,
      content: notes?.content,
    });
  }
  function onDataChange(notes: Partial<NNotes>) {
    const newState = produce(state, (drafState) => {
      Object.assign(drafState.data, notes);
    });
    setState(newState);
  }
  async function onOk() {
    if (state.added) {
      const addRsp = await SNotes.addItem(state.data);
      if (addRsp.success) {
        const newNotesRsp = NRsp.addItem(props.rsp, (newDataList) => {
          newDataList.splice(state.index, 0, addRsp.data);
          return newDataList;
        });
        NModel.dispatch(new NMDNotes.ARSetRsp(newNotesRsp));

        onClose();
      }
    } else {
      const editRsp = await SNotes.editItem(state.data);
      if (editRsp.success) {
        const newNotesRsp = NRsp.updateItem(
          props.rsp,
          state.data,
          (data) => data.id === state.data.id
        );
        NModel.dispatch(new NMDNotes.ARSetRsp(newNotesRsp));

        onClose();
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
    const notes: Partial<NNotes> = {
      base64: { ...state.data.base64 },
      content: state.data.content,
    };

    if (dataTransfer.types.includes("Files")) {
      for (let i = 0; i < dataTransfer.files.length; i++) {
        const file = dataTransfer.files[i];
        loadCountRef.current++;

        convertFile(file, notes);
      }
    }
  }
  function convertFile(file: File, notes: Partial<NNotes>) {
    const { type } = file;
    if (type.includes("image")) {
      convertImgFile(file, notes);
    } else {
      message.warning("只支持图片文件!");
    }
  }
  function convertImgFile(file: File, notes: Partial<NNotes>) {
    let reader = new FileReader();

    reader.onload = function (event) {
      //转换为自定义图片
      let fileName =
        NNotes.imgProtocolKey +
        "://" +
        ((Math.random() * 1000000) | 0) +
        "." +
        file.type.split("/")[1];
      loadCountRef.current--;
      notes.base64[fileName] = event.target.result;
      notes.content += "\n" + fileName + "\n";
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
    var clipboardItems = event.clipboardData && event.clipboardData.items;
    const notes: Partial<NNotes> = {
      base64: { ...state.data.base64 },
      content: state.data.content,
    };
    if (clipboardItems && clipboardItems.length) {
      for (let i = 0; i < clipboardItems.length; i++) {
        if (
          clipboardItems[i].kind === "file" &&
          clipboardItems[i].type.indexOf("image") !== -1
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
};
export default forwardRef(EditModal);
