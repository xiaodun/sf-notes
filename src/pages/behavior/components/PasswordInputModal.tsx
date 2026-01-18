import { useState, useRef, useEffect, useImperativeHandle, forwardRef, ForwardRefRenderFunction } from "react";
import { Modal, Input, message } from "antd";
import React from "react";

export interface IPasswordInputModalProps {
  title?: string;
  placeholder?: string;
  onOk: (password: string) => void;
  onCancel?: () => void;
}

export interface IPasswordInputModal {
  show: () => void;
  hide: () => void;
}

const PasswordInputModal: ForwardRefRenderFunction<IPasswordInputModal, IPasswordInputModalProps> = (props, ref) => {
  const { title = "输入密码", placeholder = "请输入密码", onOk, onCancel } = props;
  const [visible, setVisible] = useState(false);
  const [password, setPassword] = useState("");
  const passwordInputNameRef = useRef(`pwd_${Math.random().toString(36).substring(7)}`);
  const passwordInputRef = useRef<any>(null);

  // 当模态框打开时，设置焦点并清空密码
  useEffect(() => {
    if (visible) {
      setPassword("");
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [visible]);

  useImperativeHandle(ref, () => ({
    show: () => {
      setVisible(true);
    },
    hide: () => {
      setVisible(false);
      setPassword("");
    },
  }));

  const handleOk = () => {
    if (!password.trim()) {
      message.warning("请输入密码");
      return;
    }
    onOk(password);
    setVisible(false);
    setPassword("");
  };

  const handleCancel = () => {
    setVisible(false);
    setPassword("");
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Modal
      title={title}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      zIndex={1002}
    >
      <div style={{ marginBottom: 8, fontWeight: 500 }}>密码：</div>
      <Input.Password
        ref={passwordInputRef}
        value={password}
        placeholder={placeholder}
        onChange={(e) => {
          const value = e?.target?.value ?? "";
          setPassword(value);
        }}
        onPressEnter={handleOk}
        autoComplete="new-password"
        name={passwordInputNameRef.current}
        readOnly={false}
        data-1p-ignore="true"
        data-lpignore="true"
        data-form-type="other"
        data-bwignore="true"
        data-bwignore-label="true"
      />
    </Modal>
  );
};

export default forwardRef(PasswordInputModal);

