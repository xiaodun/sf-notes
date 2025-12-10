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

  // 格式化内容：以中文标点符号为分割点，每句话加一个空行
  // 支持的标点符号：句号。、问号？、感叹号！、分号；
  function formatContent() {
    if (!state.data?.content) {
      message.warning("没有内容需要格式化");
      return;
    }
    const content = state.data.content.trim();

    if (!content) {
      message.warning("没有内容需要格式化");
      return;
    }

    // 按中文标点符号分割，保留标点符号
    // 匹配：句号。、问号？、感叹号！、分号；
    const sentences = content
      .split(/([。？！；])/)
      .filter((item) => item.trim());
    const result: string[] = [];
    let currentSentence = "";

    sentences.forEach((item) => {
      // 检查是否是结束标点符号
      if (/[。？！；]/.test(item)) {
        currentSentence += item;
        if (currentSentence.trim()) {
          result.push(currentSentence.trim());
          result.push(""); // 每句话后加一个空行
        }
        currentSentence = "";
      } else {
        currentSentence += item;
      }
    });

    // 处理最后没有标点符号的内容
    if (currentSentence.trim()) {
      result.push(currentSentence.trim());
    }

    const formatted = result.join("\n");
    const newState = produce(state, (drafState) => {
      if (drafState.data) {
        drafState.data.content = formatted;
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
              title="格式化内容：以标点符号（。？！；）为分割点，每句话加一个空行"
            >
              格式化
            </Button>
          </div>
          <Input.TextArea
            ref={textAreaRef}
            value={state.data?.content || ""}
            placeholder="请输入内容（支持粘贴，点击格式化按钮可按标点符号（。？！；）分隔并添加空行）"
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
