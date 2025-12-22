import NMaxim from "../NMaxim";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
} from "react";
import { Modal, Input, Space, Button, message } from "antd";
import { FormatPainterOutlined } from "@ant-design/icons";
import React from "react";
import SMaxim from "../SMaxim";
import { produce } from "immer";
import NRsp from "@/common/namespace/NRsp";
import { TextAreaRef } from "antd/lib/input/TextArea";

export interface IEditModalProps {
  rsp: NRsp<NMaxim>;
  onOk: () => void;
}

export interface IEditModalState {
  open: boolean;
  index: number;
  data: NMaxim;
  added: boolean;
}

export interface IEditModal {
  showModal: (data?: NMaxim, index?: number) => void;
}

const defaultState: IEditModalState = {
  added: false,
  open: false,
  index: 0,
  data: {
    content: "",
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

  useImperativeHandle(ref, () => ({
    showModal: (data, index) => {
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        drafState.index = index;
        if (data) {
          drafState.added = false;
          drafState.data = { ...data };
        } else {
          drafState.added = true;
          drafState.data = {
            content: "",
            createTime: null,
            updateTime: null,
          };
        }
      });

      setState(newState);
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 20);
    },
  }));

  const title = state.added ? "添加" : "修改";

  async function onOk() {
    if (!state.data?.content?.trim()) {
      message.warning("请输入内容");
      return;
    }

    if (state.added) {
      const params = { ...state.data };
      const addRsp = await SMaxim.addItem(params, 0);
      if (addRsp.success) {
        onClose();
        props.onOk();
      } else {
        message.error((addRsp as any).msg || "添加失败");
      }
    } else {
      const editRsp = await SMaxim.editItem(state.data as NMaxim);
      if (editRsp.success) {
        onClose();
        props.onOk();
      } else {
        message.error((editRsp as any).msg || "修改失败");
      }
    }
  }

  function onClose() {
    setState({ ...defaultState });
  }

  // 格式化内容：处理多个引号连在一起的情况，将它们分行展示
  function formatContent() {
    if (!state.data?.content) {
      message.warning("没有内容需要格式化");
      return;
    }
    let content = state.data.content.trim();

    if (!content) {
      message.warning("没有内容需要格式化");
      return;
    }

    // 处理多个引号连在一起的情况：检测连续的引号对模式
    // 支持中文引号（""）和英文引号（""）
    // 在它们之间插入两个换行符（一个空行），使其分行展示
    // 处理中文引号：右引号"（U+201D）后面紧跟左引号"（U+201C）
    content = content.replace(/\u201D\u201C/g, "\u201D\n\n\u201C");
    // 处理英文引号：右引号"后面紧跟左引号"
    content = content.replace(/""/g, '"\n\n"');

    const newState = produce(state, (drafState) => {
      if (drafState.data) {
        drafState.data.content = content;
      }
    });
    setState(newState);
  }

  return (
    <Modal
      open={state.open}
      title={title}
      maskClosable={false}
      onOk={onOk}
      centered
      onCancel={onClose}
      width={600}
      zIndex={1001}
    >
      <Space style={{ width: "100%" }} direction="vertical" size="middle">
        <div>
          <div
            style={{
              marginBottom: 8,
              fontWeight: 500,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>内容：</span>
            <Button
              size="small"
              icon={<FormatPainterOutlined />}
              onClick={formatContent}
              title="格式化内容：将多个连在一起的引号对分行展示（每个引号对之间添加空行）"
            >
              格式化
            </Button>
          </div>
          <Input.TextArea
            ref={textAreaRef}
            value={state.data?.content || ""}
            placeholder="请输入内容（支持粘贴，点击格式化按钮可将多个连在一起的引号对分行展示）"
            autoSize={{ minRows: 6 }}
            onChange={(e) => {
              const newState = produce(state, (drafState) => {
                if (drafState.data) {
                  drafState.data.content = e.target.value;
                }
              });
              setState(newState);
            }}
            onPaste={(e) => {
              // 允许粘贴，不阻止默认行为，保持用户粘贴的格式
            }}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default forwardRef(EditModal);
