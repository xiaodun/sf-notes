import NClassics from "../NClassics";
import NAuthor from "../NAuthor";
import NDynasty from "../NDynasty";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
} from "react";
import { Modal, Input, Space, Button, Select, message, Dropdown } from "antd";
import type { MenuProps } from "antd";
import { FormatPainterOutlined } from "@ant-design/icons";
import React from "react";
import SClassics from "../SClassics";
import { produce } from "immer";
import NRsp from "@/common/namespace/NRsp";

export interface IEditModalProps {
  rsp: NRsp<NClassics>;
  authors: NAuthor[];
  dynasties: NDynasty[];
  onOk: (shouldResetToFirst?: boolean, updatedClassic?: NClassics) => void;
  onAuthorChange: () => void; // 作者列表变化时的回调
}

export interface IEditModalState {
  open: boolean;
  data: NClassics;
  added: boolean;
}

export interface IEditModal {
  showModal: (data?: NClassics) => void;
}

const defaultState: IEditModalState = {
  added: false,
  open: false,
  data: {
    title: "",
    authorId: "",
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
  // 直接使用 props 传递的 authors 和 dynasties，不进行额外的接口调用
  // 父组件会在需要时更新这些数据（如打开模态框时、作者/朝代管理后）
  const authors = props.authors || [];
  const dynasties = props.dynasties || [];

  // 获取作者对应的朝代名称
  const getDynastyName = (authorId: string) => {
    const author = authors.find((a) => a.id === authorId);
    if (!author) return "";
    const dynasty = dynasties.find((d) => d.id === author.dynastyId);
    return dynasty ? dynasty.name : "";
  };

  useImperativeHandle(ref, () => ({
    showModal: (data) => {
      const newState = produce(state, (drafState) => {
        drafState.open = true;
        if (data) {
          drafState.added = false;
          drafState.data = { ...data };
        } else {
          drafState.added = true;
          drafState.data = {
            title: "",
            authorId: "",
            content: "",
            createTime: null,
            updateTime: null,
          };
        }
      });

      setState(newState);
    },
  }));

  const title = state.added ? "添加名篇" : "修改名篇";

  const handleDataChange = (field: keyof NClassics, value: any) => {
    const newState = produce(state, (drafState) => {
      if (drafState.data) {
        (drafState.data as any)[field] = value;
      }
    });
    setState(newState);
  };

  async function onOk() {
    if (!state.data?.title?.trim()) {
      message.warning("请输入标题");
      return;
    }
    if (!state.data?.authorId) {
      message.warning("请选择作者");
      return;
    }
    if (!state.data?.content?.trim()) {
      message.warning("请输入内容");
      return;
    }

    if (state.added) {
      const params = { ...state.data };
      const addRsp = await SClassics.addItem(params, 0);
      if (addRsp.success) {
        onClose();
        props.onOk(true);
      } else {
        message.error(addRsp.msg || "添加失败");
      }
    } else {
      const editRsp = await SClassics.editItem(state.data as NClassics);
      if (editRsp.success) {
        onClose();
        // 修改时只更新对应的名篇，不重新加载分页数据
        props.onOk(false, state.data as NClassics);
      } else {
        message.error(editRsp.msg || "修改失败");
      }
    }
  }

  function onClose() {
    setState({ ...defaultState });
  }

  // 格式化内容：保证一句话一段
  function formatContent() {
    if (!state.data?.content) {
      message.warning("没有内容需要格式化");
      return;
    }

    const content = state.data.content;

    // 先去除所有换行符，将内容合并为一行（保留空格）
    let merged = content.replace(/\n+/g, " ").replace(/\s+/g, " ");

    // 按中文标点符号分割：。！？；等
    // 使用正则表达式在标点符号后添加换行符
    const sentenceEndings = /([。！？；])/g;
    let formatted = merged.replace(sentenceEndings, "$1\n");

    // 去除每行首尾的空白字符
    formatted = formatted
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0) // 移除空行
      .join("\n");

    // 如果最后一行没有标点符号，也需要换行
    if (formatted && !/[。！？；]$/.test(formatted)) {
      formatted += "\n";
    }

    handleDataChange("content", formatted);
    message.success("格式化完成：已保证一句话一段");
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
        {/* 第一行：标题 */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>标题：</div>
          <Input
            value={state.data?.title || ""}
            placeholder="请输入标题"
            onChange={(e) => handleDataChange("title", e.target.value)}
          />
        </div>

        {/* 第二行：作者 */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>作者：</div>
          <Space style={{ width: "100%" }}>
            <Select
              value={state.data?.authorId || undefined}
              placeholder="请选择作者"
              style={{ flex: 1 }}
              onChange={(value) => handleDataChange("authorId", value)}
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={authors.map((author) => ({
                label: author.name,
                value: author.id,
              }))}
            />
            <Button
              onClick={async () => {
                props.onAuthorChange();
                // 等待作者管理模态框关闭后，刷新作者和朝代列表
                // 这里通过 props 传递的 authors 和 dynasties 会在父组件更新后自动更新
              }}
            >
              管理作者
            </Button>
          </Space>
        </div>

        {/* 第三行：内容 */}
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
              title="格式化内容：保证一句话一段"
            >
              格式化
            </Button>
          </div>
          <Input.TextArea
            value={state.data?.content || ""}
            placeholder="请输入内容（支持粘贴，点击格式化按钮可保证一句话一段）"
            autoSize={{ minRows: 6 }}
            onChange={(e) => handleDataChange("content", e.target.value)}
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
