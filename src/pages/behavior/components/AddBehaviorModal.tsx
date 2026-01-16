import NBehavior from "../NBehavior";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import { Modal, Input, Space, Button, message, Radio } from "antd";
import React from "react";
import SBehavior from "../SBehavior";
import { produce } from "immer";
import NRsp from "@/common/namespace/NRsp";

export interface IAddBehaviorModalProps {
  rsp: NRsp<NBehavior>;
  onOk: () => void;
}

export interface IAddBehaviorModalState {
  open: boolean;
  name: string;
  encrypted: boolean;
  encryptCode: string; // 加密密码（只存在内存中）
}

export interface IAddBehaviorModal {
  showModal: () => void;
}

const defaultState: IAddBehaviorModalState = {
  open: false,
  name: "",
  encrypted: false,
  encryptCode: "",
};

// 生成6位随机数字
const generateEncryptCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const AddBehaviorModal: ForwardRefRenderFunction<
  IAddBehaviorModal,
  IAddBehaviorModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddBehaviorModalState>(defaultState);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState({
        open: true,
        name: "",
        encrypted: false,
        encryptCode: "",
      });
    },
  }));

  async function onOk() {
    if (!state.name || !state.name.trim()) {
      message.warning("请输入活动名称");
      return;
    }

    const behaviorData: NBehavior = {
      name: state.name.trim(),
      encrypted: state.encrypted ?? false,
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };

    // 注意：encryptCode 只存在内存中，不存储到后台
    const addRsp = await SBehavior.addItem(behaviorData, 0);
    if (addRsp.success) {
      onClose();
      props.onOk();
    } else {
      message.error((addRsp as any).msg || "添加失败");
    }
  }

  function onClose() {
    setState({ ...defaultState });
  }

  function handleEncryptedChange(e: any) {
    const value = e?.target?.value;
    if (value === undefined) return;
    const encrypted = value === "yes";
    const newCode = encrypted ? generateEncryptCode() : "";
    setState((prev) => ({
      ...prev,
      encrypted,
      encryptCode: newCode,
    }));
  }

  return (
    <Modal
      open={state.open}
      title="添加行为"
      maskClosable={false}
      onOk={onOk}
      centered
      onCancel={onClose}
      width={500}
      zIndex={1001}
    >
      <Space style={{ width: "100%" }} direction="vertical" size="middle">
        <div>
          <div
            style={{
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            活动名称：
          </div>
          <Input
            value={state.name}
            placeholder="请输入活动名称"
            onChange={(e) => {
              const value = e?.target?.value || "";
              setState((prev) => ({
                ...prev,
                name: value,
              }));
            }}
          />
        </div>
        <div>
          <div
            style={{
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            是否加密：
          </div>
          <Radio.Group
            value={state.encrypted ? "yes" : "no"}
            onChange={handleEncryptedChange}
          >
            <Radio value="no">不加密</Radio>
            <Radio value="yes">加密</Radio>
          </Radio.Group>
          {state.encrypted && state.encryptCode && (
            <div
              style={{
                marginTop: 12,
                padding: 12,
                background: "#f0f0f0",
                borderRadius: 4,
                color: "#666",
                fontSize: 14,
              }}
            >
              <div style={{ marginBottom: 4 }}>加密密码（仅显示一次）：</div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                {state.encryptCode}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                提示：此密码只存在内存中，关闭后将无法查看，请妥善保存
              </div>
            </div>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default forwardRef(AddBehaviorModal);

