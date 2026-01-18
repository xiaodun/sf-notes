import NBehavior from "../NBehavior";
import NBehaviorRecord from "../NBehaviorRecord";
import NBehaviorTag from "../NBehaviorTag";
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
import NRsp from "@/common/namespace/NRsp";
import { decryptText, encryptText } from "../utils/encrypt";
import passwordManager from "../utils/passwordManager";
import PasswordInputModal, { IPasswordInputModal } from "./PasswordInputModal";
import UCopy from "@/common/utils/UCopy";

const generateEncryptCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 11; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export interface IEditBehaviorModalProps {
  rsp: NRsp<NBehavior>;
  onOk: () => void;
}

export interface IEditBehaviorModalState {
  open: boolean;
  data: NBehavior | null;
  password: string;
  decryptedName: string;
  isEncrypted: boolean;
  newPassword: string; // 新生成的密码（仅显示一次）
}

export interface IEditBehaviorModal {
  showModal: (data: NBehavior) => void;
}

const defaultState: IEditBehaviorModalState = {
  open: false,
  data: null,
  password: "",
  decryptedName: "",
  isEncrypted: false,
  newPassword: "",
};

export const EditBehaviorModal: ForwardRefRenderFunction<
  IEditBehaviorModal,
  IEditBehaviorModalProps
> = (props, ref) => {
  const [state, setState] = useState<IEditBehaviorModalState>(defaultState);
  const nameInputRef = useRef<any>(null);
  const passwordModalRef = useRef<IPasswordInputModal>();

  // 当主 Modal 打开时，设置名称输入框焦点
  useEffect(() => {
    if (state.open) {
      setTimeout(() => {
        if (nameInputRef.current) {
          nameInputRef.current.focus();
        }
      }, 100);
    }
  }, [state.open]);

  useImperativeHandle(ref, () => ({
    showModal: (data: NBehavior) => {
      const isEncrypted = !!(data.encryptedData && data.encryptedName);
      if (isEncrypted) {
        // 如果是加密行为，检查全局密码管理器
        if (passwordManager.isVerified()) {
          const globalPassword = passwordManager.getPassword();
          try {
            // 尝试解密，如果失败也不报错，让用户输入密码
            const decryptedName = decryptText(data.encryptedName, globalPassword);
            setState({
              open: true,
              data: { ...data },
              password: globalPassword,
              decryptedName: decryptedName,
              isEncrypted: true,
            });
          } catch (error) {
            // 解密失败，需要重新输入密码（不报错）
            setState({
              open: true,
              data: { ...data },
              password: "",
              decryptedName: "",
              isEncrypted: true,
            });
            passwordModalRef.current?.show();
          }
        } else {
          // 需要先输入密码
          setState({
            open: true,
            data: { ...data },
            password: "",
            decryptedName: "",
            isEncrypted: true,
          });
          passwordModalRef.current?.show();
        }
      } else {
        setState({
          open: true,
          data: { ...data },
          password: "",
          decryptedName: data.name || "",
          isEncrypted: false,
        });
      }
    },
  }));

  // 处理加密状态切换
  const handleEncryptedChange = (e: any) => {
    const value = e?.target?.value;
    if (value === undefined) return;
    const encrypted = value === "yes";
    
    if (encrypted && !state.isEncrypted) {
      // 从不加密切换到加密
      // 如果 decryptedName 未定义，使用当前的 state.data.name
      const currentName = state.decryptedName !== undefined && state.decryptedName !== null
        ? state.decryptedName
        : (state.data?.name || "");
      
      const hasExisting = hasExistingEncrypted();
      if (hasExisting) {
        // 如果已有加密行为，检查全局密码管理器
        if (passwordManager.isVerified()) {
          const globalPassword = passwordManager.getPassword();
          setState((prev) => ({
            ...prev,
            isEncrypted: true,
            password: globalPassword,
            decryptedName: currentName,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isEncrypted: true,
            password: "",
            decryptedName: currentName,
          }));
          passwordModalRef.current?.show();
        }
      } else {
        // 没有加密行为，生成新密码
        const newPassword = generateEncryptCode();
        passwordManager.setPassword(newPassword);
        setState((prev) => ({
          ...prev,
          isEncrypted: true,
          password: newPassword,
          newPassword: newPassword,
          decryptedName: currentName,
        }));
      }
    } else if (!encrypted && state.isEncrypted) {
      // 从加密切换到不加密，将 decryptedName 同步到 data.name
      const currentName = state.decryptedName !== undefined && state.decryptedName !== null
        ? state.decryptedName
        : (state.data?.name || "");
      setState((prev) => ({
        ...prev,
        isEncrypted: false,
        password: "",
        newPassword: "", // 清空新密码
        data: prev.data ? { ...prev.data, name: currentName } : null,
        decryptedName: currentName,
      }));
    }
  };

  // 处理密码输入确认
  const handlePasswordSubmit = (inputPassword: string) => {
    // 保存到全局密码管理器
    passwordManager.setPassword(inputPassword);

    // 如果是编辑加密行为，尝试解密名称（不验证，直接使用用户输入的密码）
    if (state.data?.encryptedData && state.data.encryptedName) {
      try {
        const decryptedName = decryptText(state.data.encryptedName, inputPassword);
        setState(prev => ({
          ...prev,
          password: inputPassword,
          decryptedName: decryptedName,
        }));
      } catch (error) {
        // 解密失败也不报错，直接使用用户输入的密码，清空名称让用户重新输入
        setState(prev => ({
          ...prev,
          password: inputPassword,
          decryptedName: "",
        }));
      }
    } else {
      // 如果是从不加密切换到加密，保存密码
      setState(prev => ({
        ...prev,
        password: inputPassword,
      }));
    }
  };

  // 检查是否已有加密行为
  const hasExistingEncrypted = () => {
    return props.rsp.list.some(item => item.encryptedData);
  };

  // 复制密码
  const handleCopyPassword = () => {
    if (!state.newPassword) return;
    UCopy.copyStr(state.newPassword, { useSuccess: true, useFail: true });
  };

  async function onOk() {
    // 直接使用 decryptedName
    const newName = (state.decryptedName ?? "").trim();

    if (!newName) {
      message.warning("请输入活动名称");
      return;
    }

    if (!state.data?.id) {
      message.error("数据ID不存在");
      return;
    }

    const behaviorData: NBehavior = {
      id: state.data.id,
      name: newName,
      createTime: state.data.createTime,
      updateTime: new Date().toISOString(),
    };

    // 检查是否从加密切换到不加密，或从不加密切换到加密
    const wasEncrypted = !!(state.data?.encryptedData && state.data?.encryptedName);
    const switchingToUnencrypted = wasEncrypted && !state.isEncrypted;
    const switchingToEncrypted = !wasEncrypted && state.isEncrypted;

    // 根据加密状态处理
    if (state.isEncrypted) {
      // 如果能编辑加密行为，说明已经有全局密码了，直接用全局密码加密新名称
      const password = state.password || passwordManager.getPassword();
      
      if (!password) {
        message.warning("加密行为需要密码，请输入密码");
        passwordModalRef.current?.show();
        return;
      }

      try {
        behaviorData.encryptedData = encryptText("加密", password);
        behaviorData.encryptedName = encryptText(newName, password);
        behaviorData.name = "***";
        
        // 加密 createTime 和 updateTime
        behaviorData.encryptedCreateTime = encryptText(String(state.data.createTime), password);
        behaviorData.encryptedUpdateTime = encryptText(new Date().toISOString(), password);
        behaviorData.createTime = 0; // 使用占位符
        behaviorData.updateTime = ""; // 使用占位符
        
        // 如果从不加密切换到加密，需要加密所有记录和标签
        if (switchingToEncrypted) {
          // 获取该行为的完整数据（包含 records 和 tags）
          const fullBehaviorResult = await SBehavior.getItem(state.data.id);
          if (fullBehaviorResult.success) {
            const fullBehavior = (fullBehaviorResult as any).data?.data || (fullBehaviorResult as any).data || fullBehaviorResult;
            
            // 加密所有记录
            if (fullBehavior.records && fullBehavior.records.length > 0) {
              const encryptedRecords = fullBehavior.records.map((record: NBehaviorRecord) => {
                const encryptedRecord = { ...record };
                
                // 加密描述（如果存在且未加密）
                if (record.description && !record.encryptedDescription) {
                  try {
                    encryptedRecord.encryptedDescription = encryptText(record.description, password);
                    encryptedRecord.description = "";
                  } catch (error) {
                    // 加密失败，保留原值
                  }
                }
                
                // 加密记录中的标签值
                if (record.tags && record.tags.length > 0) {
                  encryptedRecord.tags = record.tags.map((tag: any) => {
                    if (tag.value !== undefined && tag.value !== null && !tag.encryptedValue) {
                      try {
                        // 将 value 转为字符串再加密
                        const valueStr = String(tag.value);
                        return {
                          ...tag,
                          encryptedValue: encryptText(valueStr, password),
                          value: undefined,
                        };
                      } catch (error) {
                        return tag;
                      }
                    }
                    return tag;
                  });
                }
                
                return encryptedRecord;
              });
              behaviorData.records = encryptedRecords;
            }
            
            // 加密所有标签
            if (fullBehavior.tags && fullBehavior.tags.length > 0) {
              const encryptedTags = fullBehavior.tags.map((tag: NBehaviorTag) => {
                const encryptedTag = { ...tag };
                
                // 加密标签名称（如果存在且未加密）
                if (tag.name && !tag.encryptedName) {
                  try {
                    encryptedTag.encryptedName = encryptText(tag.name, password);
                    encryptedTag.name = undefined;
                  } catch (error) {
                    // 加密失败，保留原值
                  }
                }
                
                return encryptedTag;
              });
              behaviorData.tags = encryptedTags;
            }
          }
        }
      } catch (error) {
        message.error("加密失败");
        return;
      }
    } else {
      // 不加密：清除加密字段
      behaviorData.encryptedData = undefined;
      behaviorData.encryptedName = undefined;
      behaviorData.encryptedCreateTime = undefined;
      behaviorData.encryptedUpdateTime = undefined;
      
      // 如果从加密切换到不加密，需要解密所有记录和标签，以及时间字段
      if (switchingToUnencrypted) {
        const password = state.password || passwordManager.getPassword();
        
        if (password) {
          // 解密 createTime 和 updateTime
          if (state.data.encryptedCreateTime) {
            try {
              const decryptedCreateTime = decryptText(state.data.encryptedCreateTime, password);
              behaviorData.createTime = Number(decryptedCreateTime) || state.data.createTime;
            } catch (error) {
              // 解密失败，保留原值
            }
          }
          if (state.data.encryptedUpdateTime) {
            try {
              behaviorData.updateTime = decryptText(state.data.encryptedUpdateTime, password);
            } catch (error) {
              // 解密失败，使用当前时间
              behaviorData.updateTime = new Date().toISOString();
            }
          }
          
          // 获取该行为的完整数据（包含 records 和 tags）
          const fullBehaviorResult = await SBehavior.getItem(state.data.id);
          if (fullBehaviorResult.success) {
            const fullBehavior = (fullBehaviorResult as any).data?.data || (fullBehaviorResult as any).data || fullBehaviorResult;
            
            // 解密所有记录
            if (fullBehavior.records && fullBehavior.records.length > 0) {
              const decryptedRecords = fullBehavior.records.map((record: NBehaviorRecord) => {
                const decryptedRecord = { ...record };
                
                // 解密描述
                if (record.encryptedDescription) {
                  try {
                    decryptedRecord.description = decryptText(record.encryptedDescription, password);
                    delete (decryptedRecord as any).encryptedDescription;
                  } catch (error) {
                    // 解密失败，保留原值
                  }
                }
                
                // 解密记录中的标签值
                if (record.tags && record.tags.length > 0) {
                  decryptedRecord.tags = record.tags.map((tag: any) => {
                    if (tag.encryptedValue) {
                      try {
                        const decryptedValueStr = decryptText(tag.encryptedValue, password);
                        // 尝试解析为 number 或 boolean，如果失败则保持字符串
                        let decryptedValue: string | number | boolean = decryptedValueStr;
                        if (decryptedValueStr === "true") {
                          decryptedValue = true;
                        } else if (decryptedValueStr === "false") {
                          decryptedValue = false;
                        } else {
                          const numValue = Number(decryptedValueStr);
                          if (!isNaN(numValue)) {
                            decryptedValue = numValue;
                          }
                        }
                        return {
                          ...tag,
                          value: decryptedValue,
                          encryptedValue: undefined,
                        };
                      } catch (error) {
                        return tag;
                      }
                    }
                    return tag;
                  });
                }
                
                return decryptedRecord;
              });
              behaviorData.records = decryptedRecords;
            }
            
            // 解密所有标签
            if (fullBehavior.tags && fullBehavior.tags.length > 0) {
              const decryptedTags = fullBehavior.tags.map((tag: NBehaviorTag) => {
                const decryptedTag = { ...tag };
                
                // 解密标签名称
                if (tag.encryptedName) {
                  try {
                    decryptedTag.name = decryptText(tag.encryptedName, password);
                    delete (decryptedTag as any).encryptedName;
                  } catch (error) {
                    // 解密失败，保留原值
                  }
                }
                
                return decryptedTag;
              });
              behaviorData.tags = decryptedTags;
            }
          }
        }
      }
    }

    const editRsp = await SBehavior.editItem(behaviorData);
    if (editRsp.success) {
      onClose();
      props.onOk();
    } else {
      message.error((editRsp as any).msg || "修改失败");
    }
  }

  function onClose() {
    setState({ ...defaultState });
  }

  return (
    <Modal
      open={state.open}
      title="修改行为"
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
            value={state.decryptedName ?? ""}
            placeholder="请输入活动名称"
            onChange={(e) => {
              // 直接更新 decryptedName
              const value = e?.target?.value ?? "";
              setState(prev => ({ ...prev, decryptedName: value }));
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
            value={state.isEncrypted ? "yes" : "no"}
            onChange={handleEncryptedChange}
          >
            <Radio value="no">不加密</Radio>
            <Radio value="yes">加密</Radio>
          </Radio.Group>
          {state.isEncrypted && state.newPassword && !hasExistingEncrypted() && (
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
                {state.newPassword}
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
        placeholder="请输入密码"
        onOk={handlePasswordSubmit}
        onCancel={() => {
          onClose();
        }}
      />
    </Modal>
  );
};

export default forwardRef(EditBehaviorModal);

