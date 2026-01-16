import NBehavior from "../NBehavior";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import { Modal, Input, Space, Button, message } from "antd";
import React from "react";
import SBehavior from "../SBehavior";
import NRsp from "@/common/namespace/NRsp";

export interface IEditBehaviorModalProps {
  rsp: NRsp<NBehavior>;
  onOk: () => void;
}

export interface IEditBehaviorModalState {
  open: boolean;
  data: NBehavior | null;
}

export interface IEditBehaviorModal {
  showModal: (data: NBehavior) => void;
}

const defaultState: IEditBehaviorModalState = {
  open: false,
  data: null,
};

export const EditBehaviorModal: ForwardRefRenderFunction<
  IEditBehaviorModal,
  IEditBehaviorModalProps
> = (props, ref) => {
  const [state, setState] = useState<IEditBehaviorModalState>(defaultState);

  useImperativeHandle(ref, () => ({
    showModal: (data: NBehavior) => {
      setState({
        open: true,
        data: { ...data },
      });
    },
  }));

  async function onOk() {
    if (!state.data?.name || !state.data.name.trim()) {
      message.warning("请输入活动名称");
      return;
    }

    if (!state.data?.id) {
      message.error("数据ID不存在");
      return;
    }

    const behaviorData: NBehavior = {
      id: state.data.id,
      name: state.data.name.trim(),
      encryptedData: state.data.encryptedData, // 保持加密数据不变
      createTime: state.data.createTime,
      updateTime: new Date().toISOString(),
    };

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
            value={state.data?.name || ""}
            placeholder="请输入活动名称"
            onChange={(e) => {
              const value = e?.target?.value || "";
              setState((prev) => ({
                ...prev,
                data: prev.data ? { ...prev.data, name: value } : null,
              }));
            }}
          />
        </div>
        {state.data?.encryptedData && (
          <div style={{ fontSize: 12, color: "#999" }}>
            注意：此行为已加密，只能修改名称
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default forwardRef(EditBehaviorModal);

