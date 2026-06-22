import {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  ForwardRefRenderFunction,
} from "react";
import { Modal, Input, Button, message } from "antd";
import { CopyOutlined, UnlockOutlined } from "@ant-design/icons";
import React from "react";
import NBehavior from "../NBehavior";
import { decryptText, encryptText } from "../utils/encrypt";
import passwordManager from "../utils/passwordManager";
import SBehavior from "../SBehavior";
import UCopy from "@/common/utils/UCopy";

const generateEncryptCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 11; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

export interface IChangePasswordModalProps {
  encryptedBehaviors: NBehavior[];
  onOk: () => void;
}

export interface IChangePasswordModal {
  show: () => void;
  hide: () => void;
}

interface IState {
  open: boolean;
  newPassword: string;
  loading: boolean;
}

const ChangePasswordModal: ForwardRefRenderFunction<
  IChangePasswordModal,
  IChangePasswordModalProps
> = (props, ref) => {
  const [state, setState] = useState<IState>({
    open: false,
    newPassword: "",
    loading: false,
  });
  const pwdInputNameRef = useRef(`pwd_${Math.random().toString(36).substring(7)}`);

  useImperativeHandle(ref, () => ({
    show: () => {
      setState({
        open: true,
        newPassword: "",
        loading: false,
      });
    },
    hide: () => {
      setState((prev) => ({ ...prev, open: false }));
    },
  }));

  const handleCopyPassword = () => {
    if (!state.newPassword) return;
    UCopy.copyStr(state.newPassword, { useSuccess: true, useFail: true });
  };

  const handleOk = async () => {
    if (!state.newPassword.trim()) {
      message.warning("请输入新密码");
      return;
    }

    const oldPassword = passwordManager.getPassword();
    if (!oldPassword) {
      message.error("当前密码不存在，请先验证密码");
      return;
    }

    const newPwd = state.newPassword.trim();
    const behaviors = props.encryptedBehaviors;

    if (behaviors.length === 0) {
      message.warning("没有需要重新加密的行为");
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      for (const behavior of behaviors) {
        if (!behavior.id) continue;

        // 获取完整的行为数据（包含 records 和 tags）
        const fullResult = await SBehavior.getItem(behavior.id);
        if (!fullResult.success) continue;
        const fullBehavior: any =
          (fullResult as any).data?.data ||
          (fullResult as any).data ||
          fullResult;

        // 解密名称
        const decryptedName =
          decryptText(fullBehavior.encryptedName || "", oldPassword) ||
          fullBehavior.name;

        const updatedBehavior: any = {
          id: fullBehavior.id,
          name: "***",
          createTime: 0,
          updateTime: new Date().toISOString(),
        };

        // 重新加密基本字段
        updatedBehavior.encryptedData = encryptText("加密", newPwd);
        updatedBehavior.encryptedName = encryptText(decryptedName, newPwd);

        // 重新加密时间字段
        if (fullBehavior.encryptedCreateTime) {
          const decryptedCreateTime = decryptText(
            fullBehavior.encryptedCreateTime,
            oldPassword
          );
          updatedBehavior.encryptedCreateTime = encryptText(
            decryptedCreateTime || String(fullBehavior.createTime || 0),
            newPwd
          );
        } else {
          updatedBehavior.encryptedCreateTime = encryptText(
            String(fullBehavior.createTime || 0),
            newPwd
          );
        }

        updatedBehavior.encryptedUpdateTime = encryptText(
          new Date().toISOString(),
          newPwd
        );

        // 重新加密记录
        if (fullBehavior.records && fullBehavior.records.length > 0) {
          updatedBehavior.records = fullBehavior.records.map((record: any) => {
            const updated = { ...record };

            // 重新加密描述
            if (record.encryptedDescription) {
              const decrypted = decryptText(
                record.encryptedDescription,
                oldPassword
              );
              updated.encryptedDescription = encryptText(decrypted, newPwd);
            }

            // 重新加密记录中的标签值
            if (record.tags && record.tags.length > 0) {
              updated.tags = record.tags.map((tag: any) => {
                if (tag.encryptedValue) {
                  const decrypted = decryptText(tag.encryptedValue, oldPassword);
                  return {
                    ...tag,
                    encryptedValue: encryptText(decrypted, newPwd),
                  };
                }
                return tag;
              });
            }

            return updated;
          });
        }

        // 重新加密行为专属标签（非全局标签）
        if (fullBehavior.tags && fullBehavior.tags.length > 0) {
          updatedBehavior.tags = fullBehavior.tags.map((tag: any) => {
            const updated = { ...tag };
            if (tag.encryptedName) {
              const decrypted = decryptText(tag.encryptedName, oldPassword);
              updated.encryptedName = encryptText(decrypted, newPwd);
            }
            return updated;
          });
        }

        await SBehavior.editItem(updatedBehavior);
      }

      // 更新全局密码
      passwordManager.setPassword(newPwd);
      message.success("密码修改成功");
      setState((prev) => ({ ...prev, open: false }));
      props.onOk();
    } catch (error) {
      message.error("密码修改失败，请重试");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleClearPassword = async () => {
    const oldPassword = passwordManager.getPassword();
    if (!oldPassword) {
      message.error("当前密码不存在，请先验证密码");
      return;
    }

    const behaviors = props.encryptedBehaviors;
    if (behaviors.length === 0) {
      message.warning("没有需要解密的行为");
      return;
    }

    setState((prev) => ({ ...prev, loading: true }));

    try {
      for (const behavior of behaviors) {
        if (!behavior.id) continue;

        const fullResult = await SBehavior.getItem(behavior.id);
        if (!fullResult.success) continue;
        const fullBehavior: any =
          (fullResult as any).data?.data ||
          (fullResult as any).data ||
          fullResult;

        // 解密名称和时间
        const decryptedName =
          decryptText(fullBehavior.encryptedName || "", oldPassword) ||
          fullBehavior.name;

        let decryptedCreateTime = fullBehavior.createTime || 0;
        if (fullBehavior.encryptedCreateTime) {
          const t = decryptText(fullBehavior.encryptedCreateTime, oldPassword);
          if (t) decryptedCreateTime = Number(t) || fullBehavior.createTime;
        }

        let decryptedUpdateTime = new Date().toISOString();
        if (fullBehavior.encryptedUpdateTime) {
          const t = decryptText(fullBehavior.encryptedUpdateTime, oldPassword);
          if (t) decryptedUpdateTime = t;
        }

        const updatedBehavior: any = {
          id: fullBehavior.id,
          name: decryptedName,
          createTime: decryptedCreateTime,
          updateTime: decryptedUpdateTime,
          // 清除所有加密字段
          encryptedData: undefined,
          encryptedName: undefined,
          encryptedCreateTime: undefined,
          encryptedUpdateTime: undefined,
        };

        // 解密记录
        if (fullBehavior.records && fullBehavior.records.length > 0) {
          updatedBehavior.records = fullBehavior.records.map((record: any) => {
            const updated = { ...record };
            if (record.encryptedDescription) {
              updated.description = decryptText(record.encryptedDescription, oldPassword);
              delete updated.encryptedDescription;
            }
            if (record.tags && record.tags.length > 0) {
              updated.tags = record.tags.map((tag: any) => {
                if (tag.encryptedValue) {
                  const decryptedStr = decryptText(tag.encryptedValue, oldPassword);
                  let decryptedValue: string | number | boolean = decryptedStr;
                  if (decryptedStr === "true") decryptedValue = true;
                  else if (decryptedStr === "false") decryptedValue = false;
                  else {
                    const numVal = Number(decryptedStr);
                    if (!isNaN(numVal)) decryptedValue = numVal;
                  }
                  return { ...tag, value: decryptedValue, encryptedValue: undefined };
                }
                return tag;
              });
            }
            return updated;
          });
        }

        // 解密标签
        if (fullBehavior.tags && fullBehavior.tags.length > 0) {
          updatedBehavior.tags = fullBehavior.tags.map((tag: any) => {
            const updated = { ...tag };
            if (tag.encryptedName) {
              updated.name = decryptText(tag.encryptedName, oldPassword);
              delete updated.encryptedName;
            }
            return updated;
          });
        }

        await SBehavior.editItem(updatedBehavior);
      }

      // 清除全局密码
      passwordManager.clearPassword();
      message.success("已清除所有加密");
      setState((prev) => ({ ...prev, open: false }));
      props.onOk();
    } catch (error) {
      message.error("清除加密失败，请重试");
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCancel = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <Modal
      open={state.open}
      title="修改加密密码"
      maskClosable={false}
      onOk={handleOk}
      centered
      onCancel={handleCancel}
      width={500}
      zIndex={1002}
      confirmLoading={state.loading}
    >
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            marginBottom: 8,
            fontWeight: 500,
          }}
        >
          新密码：
        </div>
        <Input.Password
          value={state.newPassword}
          placeholder="请输入新密码"
          onChange={(e) => {
            const value = e?.target?.value ?? "";
            setState((prev) => ({ ...prev, newPassword: value }));
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
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Button
          type="button"
          size="small"
          onClick={() => {
            const newCode = generateEncryptCode();
            setState((prev) => ({
              ...prev,
              newPassword: newCode,
            }));
          }}
        >
          生成随机密码
        </Button>
        {state.newPassword && (
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
      <div
        style={{
          marginTop: 16,
          paddingTop: 16,
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <Button
          type="button"
          danger
          size="small"
          icon={<UnlockOutlined />}
          loading={state.loading}
          onClick={() => {
            Modal.confirm({
              title: "确认清除加密",
              content: "所有已加密的行为将被解密，密码将被清除。确定继续？",
              okText: "确定",
              cancelText: "取消",
              okButtonProps: { danger: true },
              zIndex: 1003,
              onOk: handleClearPassword,
            });
          }}
        >
          不设置密码（清除所有加密）
        </Button>
      </div>
    </Modal>
  );
};

export default forwardRef(ChangePasswordModal);
