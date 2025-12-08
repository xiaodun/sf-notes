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

  // 格式化内容：按字符数分段，但不截断句子
  function formatContent() {
    if (!state.data?.content) {
      message.warning("没有内容需要格式化");
      return;
    }
    const content = state.data.content;
    // 将多个换行符合并为一个空格，统一处理
    let merged = content.replace(/\n+/g, " ").replace(/\s+/g, " ").trim();

    if (!merged) {
      message.warning("没有内容需要格式化");
      return;
    }

    // 每行最大字符数（中文字符算1个，标点符号也算1个）
    const maxCharsPerLine = 30;
    const lines: string[] = [];
    let startIndex = 0;

    while (startIndex < merged.length) {
      // 如果剩余内容不足一行，直接添加
      if (merged.length - startIndex <= maxCharsPerLine) {
        lines.push(merged.substring(startIndex).trim());
        break;
      }

      // 从 startIndex + maxCharsPerLine 开始向前查找最近的标点符号
      let endIndex = Math.min(startIndex + maxCharsPerLine, merged.length);
      let foundBreakPoint = false;

      // 优先查找句号、问号、感叹号、分号
      for (let i = endIndex; i > startIndex + maxCharsPerLine * 0.7; i--) {
        if (/[。！？；]/.test(merged[i])) {
          endIndex = i + 1;
          foundBreakPoint = true;
          break;
        }
      }

      // 如果没找到，查找逗号、顿号
      if (!foundBreakPoint) {
        for (let i = endIndex; i > startIndex + maxCharsPerLine * 0.7; i--) {
          if (/[，、]/.test(merged[i])) {
            endIndex = i + 1;
            foundBreakPoint = true;
            break;
          }
        }
      }

      // 如果还是没找到，就在最大长度处断行（避免截断）
      if (!foundBreakPoint) {
        endIndex = startIndex + maxCharsPerLine;
      }

      lines.push(merged.substring(startIndex, endIndex).trim());
      startIndex = endIndex;
    }

    const formatted = lines.join("\n");
    const newState = produce(state, (drafState) => {
      if (drafState.data) {
        drafState.data.content = formatted;
      }
    });
    setState(newState);
    message.success("格式化完成：已按字符数分段");
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
              title="格式化内容：按字符数分段，避免截断句子"
            >
              格式化
            </Button>
          </div>
          <Input.TextArea
            ref={textAreaRef}
            value={state.data?.content || ""}
            placeholder="请输入内容（支持粘贴，点击格式化按钮可按字符数分段）"
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
