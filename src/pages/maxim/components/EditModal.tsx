import NMaxim from "../NMaxim";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useRef,
} from "react";
import { Modal, Input, Space, Button, message } from "antd";
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
        message.error(addRsp.msg || "添加失败");
      }
    } else {
      const editRsp = await SMaxim.editItem(state.data as NMaxim);
      if (editRsp.success) {
        onClose();
        props.onOk();
      } else {
        message.error(editRsp.msg || "修改失败");
      }
    }
  }

  function onClose() {
    setState({ ...defaultState });
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
          <div style={{ marginBottom: 8, fontWeight: 500 }}>内容：</div>
          <Input.TextArea
            ref={textAreaRef}
            value={state.data?.content || ""}
            placeholder="请输入内容"
            autoSize={{ minRows: 6 }}
            onChange={(e) => {
              const newState = produce(state, (drafState) => {
                if (drafState.data) {
                  drafState.data.content = e.target.value;
                }
              });
              setState(newState);
            }}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default forwardRef(EditModal);

