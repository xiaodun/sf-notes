import NBehaviorTag from "../NBehaviorTag";
import {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import { Modal, Input, Space, message, Button, Select, InputNumber } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import React from "react";
import SBehavior from "../SBehavior";
import NRsp from "@/common/namespace/NRsp";
import { encryptText, decryptText } from "../utils/encrypt";

export interface ITagManageModalProps {
  behaviorId?: string; // 如果提供，则为行为标签；否则为全局标签
  isEncrypted?: boolean; // 行为是否加密
  password?: string; // 加密行为的密码
  onOk: () => void;
}

export interface ITagManageModalState {
  open: boolean;
  tags: NBehaviorTag[];
  editingTag: NBehaviorTag | null;
  editModalVisible: boolean;
  editTagName: string;
  editTagType: "number" | "boolean" | "self";
  editTagValue: number | null; // 数值类型的默认值
}

export interface ITagManageModal {
  showModal: () => void;
}

const defaultState: ITagManageModalState = {
  open: false,
  tags: [],
  editingTag: null,
  editModalVisible: false,
  editTagName: "",
  editTagType: "number",
  editTagValue: null,
};

export const TagManageModal: ForwardRefRenderFunction<
  ITagManageModal,
  ITagManageModalProps
> = (props, ref) => {
  const [state, setState] = useState<ITagManageModalState>(defaultState);
  const tagNameInputRef = useRef<any>(null);

  // 当编辑模态框打开时，自动聚焦到标签名称输入框
  useEffect(() => {
    if (state.editModalVisible && tagNameInputRef.current) {
      // 延迟一点时间，确保 Modal 已经完全渲染
      setTimeout(() => {
        tagNameInputRef.current?.focus();
      }, 100);
    }
  }, [state.editModalVisible]);

  const loadTags = async () => {
    try {
      const result = props.behaviorId
        ? await SBehavior.getBehaviorTags(props.behaviorId)
        : await SBehavior.getGlobalTags();
      if (result.success) {
        setState((prev) => ({
          ...prev,
          tags: result.list || [],
        }));
      } else {
        console.error("获取标签失败:", result);
        message.error("获取标签失败");
      }
    } catch (error) {
      console.error("获取标签失败:", error);
      message.error("获取标签失败：" + ((error as any)?.message || "未知错误"));
    }
  };

  useImperativeHandle(ref, () => ({
    showModal: async () => {
      setState({
        ...defaultState,
        open: true,
      });
      await loadTags();
    },
  }));

  const handleAdd = () => {
    setState((prev) => ({
      ...prev,
      editingTag: null,
      editModalVisible: true,
      editTagName: "",
      editTagType: "number",
      editTagValue: null,
    }));
  };

  const getTagDisplayName = (tag: NBehaviorTag): string => {
    if (tag.encryptedName && props.password && props.isEncrypted) {
      try {
        return decryptText(tag.encryptedName, props.password);
      } catch (error) {
        return "[解密失败]";
      }
    }
    return tag.name || "";
  };

  const handleEdit = (tag: NBehaviorTag) => {
    const displayName = getTagDisplayName(tag);
    setState((prev) => ({
      ...prev,
      editingTag: tag,
      editModalVisible: true,
      editTagName: displayName,
      editTagType: tag.type,
      editTagValue: null,
    }));
  };

  const handleDelete = async (tag: NBehaviorTag) => {
    try {
      const result = await SBehavior.delTag(tag.id!);
      if (result.success) {
        await loadTags();
      } else {
        message.error("删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  const handleEditOk = async () => {
    if (!state.editTagName.trim()) {
      message.warning("请输入标签名称");
      return;
    }

    const tagData: NBehaviorTag = {
      id: state.editingTag?.id,
      type: state.editTagType,
      isGlobal: !props.behaviorId,
      behaviorId: props.behaviorId,
      createTime: state.editingTag?.createTime || Date.now(),
      updateTime: new Date().toISOString(),
    };

    // 如果行为是加密的，对标签名称进行加密
    if (props.isEncrypted && props.password && props.behaviorId) {
      try {
        tagData.encryptedName = encryptText(state.editTagName.trim(), props.password);
        // 不清空 name，保留用于兼容
      } catch (error) {
        message.error("加密标签名称失败");
        return;
      }
    } else {
      tagData.name = state.editTagName.trim();
    }

    try {
      const result = state.editingTag
        ? await SBehavior.editTag(tagData)
        : await SBehavior.addTag(tagData);
      if (result.success) {
        message.success(state.editingTag ? "修改成功" : "添加成功");
        setState((prev) => ({
          ...prev,
          editModalVisible: false,
          editingTag: null,
          editTagName: "",
        }));
        await loadTags();
      } else {
        message.error((result as any).msg || "操作失败");
      }
    } catch (error) {
      console.error("操作失败:", error);
      message.error("操作失败：" + (error as any)?.message || "未知错误");
    }
  };

  const handleEditCancel = () => {
    setState((prev) => ({
      ...prev,
      editModalVisible: false,
      editingTag: null,
    }));
  };

  function onClose() {
    setState({ ...defaultState });
  }

  return (
    <>
      <Modal
        open={state.open}
        title={props.behaviorId ? "管理标签" : "管理全局标签"}
        maskClosable={false}
        onCancel={onClose}
        footer={[
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加标签
          </Button>,
          <Button key="close" onClick={onClose}>
            关闭
          </Button>,
        ]}
        width={600}
        zIndex={1001}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {state.tags.length > 0 ? (
            state.tags.map((tag) => (
              <div
                key={tag.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px",
                  background: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                <div>
                  <div style={{ fontWeight: 500 }}>{getTagDisplayName(tag)}</div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    类型：{tag.type === "number" ? "数值" : tag.type === "boolean" ? "是否" : "自身"}
                  </div>
                </div>
                <Space>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(tag)}
                  >
                    修改
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(tag)}
                  >
                    删除
                  </Button>
                </Space>
              </div>
            ))
          ) : (
            <div style={{ textAlign: "center", padding: 20, color: "#999" }}>
              暂无标签
            </div>
          )}
        </Space>
      </Modal>

      <Modal
        open={state.editModalVisible}
        title={state.editingTag ? "修改标签" : "添加标签"}
        onOk={handleEditOk}
        onCancel={handleEditCancel}
        centered
        width={400}
        zIndex={1002}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>标签名称：</div>
            <Input
              ref={tagNameInputRef}
              value={state.editTagName}
              placeholder="请输入标签名称"
              onChange={(e) => {
                const value = (e?.target?.value as string) || "";
                setState((prev) => ({
                  ...prev,
                  editTagName: value,
                }));
              }}
            />
          </div>
          <div>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>类型：</div>
            <Select
              value={state.editTagType}
              style={{ width: "100%" }}
              onChange={(value) => {
                setState((prev) => ({
                  ...prev,
                  editTagType: value,
                  editTagValue: null,
                }));
              }}
            >
              <Select.Option value="boolean">是否</Select.Option>
              <Select.Option value="number">数值</Select.Option>
              <Select.Option value="self">自身</Select.Option>
            </Select>
          </div>
        </Space>
      </Modal>
    </>
  );
};

export default forwardRef(TagManageModal);

