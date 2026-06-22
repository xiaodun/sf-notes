import NBehavior from "../NBehavior";
import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import { Modal, Input, Space, Button, message, Radio } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import React from "react";
import SBehavior from "../SBehavior";
import { produce } from "immer";
import NRsp from "@/common/namespace/NRsp";
import { encryptText } from "../utils/encrypt";
import UCopy from "@/common/utils/UCopy";
import passwordManager from "../utils/passwordManager";

export interface IAddBehaviorModalProps {
  rsp: NRsp<NBehavior>;
  onOk: () => void;
}

export interface IAddBehaviorModalState {
  open: boolean;
  name: string;
  encrypted: boolean;
  encryptCode: string;
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

const generateEncryptCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 11; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export const AddBehaviorModal: ForwardRefRenderFunction<
  IAddBehaviorModal,
  IAddBehaviorModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddBehaviorModalState>(defaultState);
  const nameInputRef = useRef<any>(null);
  const pwdInputNameRef = useRef(`pwd_${Math.random().toString(36).substring(7)}`);

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

  // 当模态框打开时，自动聚焦到名称输入框
  useEffect(() => {
    if (state.open && nameInputRef.current) {
      // 延迟一点时间，确保 Modal 已经完全渲染
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [state.open]);

  // 检查是否已有加密行为
  const hasExistingEncrypted = () => {
    return props.rsp.list.some(item => item.encryptedData);
  };

  async function onOk() {
    if (!state.name || !state.name.trim()) {
      message.warning("请输入活动名称");
      return;
    }

    // 如果选择加密但没有密码，提示用户输入
    if (state.encrypted && !state.encryptCode) {
      message.warning("请设置加密密码");
      return;
    }

    const behaviorData: NBehavior = {
      name: state.name.trim(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };

    // 如果选择了加密，则对"加密"字符串和名称进行加密后存储
    if (state.encrypted && state.encryptCode) {
      // 将密码保存到全局管理器
      passwordManager.setPassword(state.encryptCode);
      try {
        behaviorData.encryptedData = encryptText("加密", state.encryptCode);
        // 对行为名称也加密
        behaviorData.encryptedName = encryptText(state.name.trim(), state.encryptCode);
        // 将名称设置为占位符
        behaviorData.name = "***";
        // 加密 createTime 和 updateTime
        behaviorData.encryptedCreateTime = encryptText(String(behaviorData.createTime), state.encryptCode);
        behaviorData.encryptedUpdateTime = encryptText(behaviorData.updateTime, state.encryptCode);
        behaviorData.createTime = 0; // 使用占位符
        behaviorData.updateTime = ""; // 使用占位符
      } catch (error) {
        message.error("加密失败");
        return;
      }
    }

    const addRsp = await SBehavior.addItem(behaviorData, 0);
    if (addRsp.success) {
      onClose();
      props.onOk();
    } else {
      message.error((addRsp as any).msg || "添加失败");
    }
  }

  const handleCopyPassword = () => {
    if (!state.encryptCode) return;
    // 只复制密码，不包含活动名称
    UCopy.copyStr(state.encryptCode, { useSuccess: true, useFail: true });
  }

  function onClose() {
    setState({ ...defaultState });
  }

  function handleEncryptedChange(e: any) {
    const value = e?.target?.value;
    if (value === undefined) return;
    const encrypted = value === "yes";
    
    if (encrypted) {
      const hasExisting = hasExistingEncrypted();
      if (hasExisting) {
        // 如果已有加密行为，预填全局密码（可修改）
        const globalPassword = passwordManager.isVerified() ? passwordManager.getPassword() : "";
        setState((prev) => ({
          ...prev,
          encrypted,
          encryptCode: globalPassword,
        }));
      } else {
        // 如果还没有加密行为，让用户自定义密码（不自动生成）
        setState((prev) => ({
          ...prev,
          encrypted,
          encryptCode: "",
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        encrypted,
        encryptCode: "",
      }));
    }
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
            ref={nameInputRef}
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
          {state.encrypted && (
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
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                加密密码：
              </div>
              <Input.Password
                value={state.encryptCode}
                placeholder="请输入自定义密码"
                onChange={(e) => {
                  const value = e?.target?.value ?? "";
                  setState((prev) => ({ ...prev, encryptCode: value }));
                }}
                autoComplete="new-password"
                name={pwdInputNameRef.current}
                readOnly={false}
                data-1p-ignore="true"
                data-lpignore="true"
                data-form-type="other"
                data-bwignore="true"
                data-bwignore-label="true"
              />
              <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Button
                  type="button"
                  size="small"
                  onClick={() => {
                    const newCode = generateEncryptCode();
                    setState((prev) => ({ ...prev, encryptCode: newCode }));
                  }}
                >
                  生成随机密码
                </Button>
                {state.encryptCode && (
                  <Button
                    type="button"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={handleCopyPassword}
                  >
                    复制密码
                  </Button>
                )}
              </div>
              {hasExistingEncrypted() && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#fa8c16" }}>
                  提示：已有加密行为，建议使用相同密码以确保能解密已有数据。
                </div>
              )}
              <div style={{ marginTop: hasExistingEncrypted() ? 4 : 8, fontSize: 12, color: "#999" }}>
                此密码关闭后将无法查看，请妥善保存。
              </div>
            </div>
          )}
        </div>
      </Space>
    </Modal>
  );
};

export default forwardRef(AddBehaviorModal);

