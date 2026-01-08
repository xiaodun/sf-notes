import NJokes from "../NJokes";
import { useState, useImperativeHandle, forwardRef, ForwardRefRenderFunction } from "react";
import { Modal, Checkbox, Button, message } from "antd";
import React from "react";
import { produce } from "immer";
import NRsp from "@/common/namespace/NRsp";
import UCopy from "@/common/utils/UCopy";

interface IBatchCopyModalProps {
  rsp: NRsp<NJokes>;
}

interface IBatchCopyModalState {
  open: boolean;
  selectedJokes: Set<string>;
}

export interface IBatchCopyModal {
  showModal: () => void;
}

const defaultState: IBatchCopyModalState = {
  open: false,
  selectedJokes: new Set<string>(),
};

export const BatchCopyModal: ForwardRefRenderFunction<IBatchCopyModal, IBatchCopyModalProps> = (props, ref) => {
  const [state, setState] = useState<IBatchCopyModalState>(defaultState);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState(produce(state, (draftState) => {
        draftState.open = true;
        draftState.selectedJokes = new Set<string>();
      }));
    },
  }));

  // 将段子按每5个一组进行分组
  const groupJokes = () => {
    const groups: NJokes[][] = [];
    const jokes = props.rsp.list;
    
    for (let i = 0; i < jokes.length; i += 5) {
      groups.push(jokes.slice(i, i + 5));
    }
    
    return groups;
  };

  // 处理整个分组的选择
  const handleGroupSelect = (groupIndex: number, checked: boolean) => {
    const groups = groupJokes();
    const group = groups[groupIndex];
    
    setState(produce(state, (draftState) => {
      group.forEach(joke => {
        if (joke.id) {
          if (checked) {
            draftState.selectedJokes.add(joke.id);
          } else {
            draftState.selectedJokes.delete(joke.id);
          }
        }
      });
    }));
  };

  // 检查整个分组是否被全选
  const isGroupChecked = (groupIndex: number) => {
    const groups = groupJokes();
    const group = groups[groupIndex];
    
    if (group.length === 0) return false;
    
    return group.every(joke => joke.id && state.selectedJokes.has(joke.id));
  };

  // 导出选中的段子
  const handleCopySelected = async () => {
    if (state.selectedJokes.size === 0) {
      message.warning("请选择要导出的段子");
      return;
    }

    const selectedJokes = props.rsp.list.filter(joke => joke.id && state.selectedJokes.has(joke.id));
    
    // 生成要导出的内容
    const contentToCopy = selectedJokes.map((joke, index) => {
      // 兼容旧数据：如果有 content 但没有 upperContent，使用 content
      const upperContent = joke.upperContent || (joke as any).content || "";
      const lowerContent = joke.lowerContent || "";
      
      let content = "段子"+(index+1)+"："+ upperContent;
      
      if (lowerContent.trim()) {
        content += "\n" + lowerContent;
      }
      
      return content;
    }).join("\n\n");

    // 使用公共的UCopy工具进行复制
    await UCopy.copyStr(contentToCopy);
    handleClose();
  };

  const handleClose = () => {
    setState(defaultState);
  };

  const groups = groupJokes();

  return (
    <Modal
      open={state.open}
      title="导出"
      maskClosable={false}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          取消
        </Button>,
        <Button key="copy" type="primary" onClick={handleCopySelected}>
          导出选中内容
        </Button>,
      ]}
      width={800}
      style={{ maxHeight: "80vh", overflowY: "auto" }}
    >
      {groups.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`} style={{ marginBottom: 10 }}>
          <Checkbox
            checked={isGroupChecked(groupIndex)}
            onChange={(e) => handleGroupSelect(groupIndex, e.target.checked)}
            style={{ fontSize: 16 }}
          >
            {groupIndex * 5 + 1} - {Math.min((groupIndex + 1) * 5, props.rsp.list.length)}
          </Checkbox>
        </div>
      ))}
    </Modal>
  );
};

export default forwardRef(BatchCopyModal);