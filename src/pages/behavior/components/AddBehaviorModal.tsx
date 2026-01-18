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
import PasswordInputModal, { IPasswordInputModal } from "./PasswordInputModal";

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
  const passwordModalRef = useRef<IPasswordInputModal>();
  const nameInputRef = useRef<any>(null);

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

    // 如果选择加密，且已有加密行为，需要验证密码
    if (state.encrypted && hasExistingEncrypted()) {
      if (!state.encryptCode) {
        message.warning("请先输入并验证密码");
        return;
      }
    }

    // 如果选择加密但没有密码，生成新密码
    if (state.encrypted && !state.encryptCode && !hasExistingEncrypted()) {
      const newCode = generateEncryptCode();
      setState(prev => ({ ...prev, encryptCode: newCode }));
      // 这里不return，继续执行后面的逻辑
    }

    const behaviorData: NBehavior = {
      name: state.name.trim(),
      createTime: Date.now(),
      updateTime: new Date().toISOString(),
    };

    // 如果选择了加密，则对"加密"字符串和名称进行加密后存储
    if (state.encrypted && state.encryptCode) {
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
        // 如果已有加密行为，检查全局密码管理器
        if (passwordManager.isVerified()) {
          // 直接使用全局密码，不验证
          const globalPassword = passwordManager.getPassword();
          setState((prev) => ({
            ...prev,
            encrypted,
            encryptCode: globalPassword,
          }));
        } else {
          // 需要输入密码
          setState((prev) => ({
            ...prev,
            encrypted,
            encryptCode: "",
          }));
          passwordModalRef.current?.show();
        }
      } else {
        // 如果还没有加密行为，生成新密码
        const newCode = generateEncryptCode();
        setState((prev) => ({
          ...prev,
          encrypted,
          encryptCode: newCode,
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

  // 处理密码输入确认
  const handlePasswordSubmit = (inputPassword: string) => {
    // 直接使用用户输入的密码，不验证
    passwordManager.setPassword(inputPassword);
    setState(prev => ({ 
      ...prev, 
      encryptCode: inputPassword,
    }));
  };

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
          {state.encrypted && state.encryptCode && !hasExistingEncrypted() && (
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
              <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>加密密码（仅显示一次）：</span>
                <Button
                  size="small"
                  icon={<CopyOutlined />}
                  onClick={handleCopyPassword}
                >
                  复制密码
                </Button>
              </div>
              <div style={{ fontSize: 18, fontWeight: "bold", color: "#1890ff" }}>
                {state.encryptCode}
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#999" }}>
                提示：此密码关闭后将无法查看，请妥善保存。
              </div>
            </div>
          )}
        </div>
      </Space>

      <PasswordInputModal
        ref={passwordModalRef}
        title="输入密码"
        onOk={handlePasswordSubmit}
        onCancel={() => {
          setState(prev => ({ 
            ...prev, 
            encrypted: false,
            encryptCode: ""
          }));
        }}
      />
    </Modal>
  );
};

export default forwardRef(AddBehaviorModal);

