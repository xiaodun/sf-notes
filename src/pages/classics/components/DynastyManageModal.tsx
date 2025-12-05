import NDynasty from "../NDynasty";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useRef,
} from "react";
import { Modal, Input, Space, Button, Table, message } from "antd";
import React from "react";
import SDynasty from "../SDynasty";
import NRsp from "@/common/namespace/NRsp";
import type { ColumnsType } from "antd/es/table";
// 移除分页逻辑，一次加载全部数据

export interface IDynastyManageModalProps {
  onOk: () => void; // 朝代添加后的回调（用于从主页面打开时刷新）
  onDynastyAdded?: () => Promise<void>; // 朝代添加后的回调（用于从管理作者打开时刷新管理作者中的朝代列表）
}

export interface IDynastyManageModalState {
  open: boolean;
  dynasties: NDynasty[];
  loading: boolean;
}

export interface IDynastyManageModal {
  showModal: () => void;
}

const defaultState: IDynastyManageModalState = {
  open: false,
  dynasties: [],
  loading: false,
};

export const DynastyManageModal: ForwardRefRenderFunction<
  IDynastyManageModal,
  IDynastyManageModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<Partial<IDynastyManageModalState>>(defaultState);
  const [newDynasty, setNewDynasty] = useState({ name: "" });
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState({
        ...defaultState,
        open: true,
      });
      loadDynasties();
    },
  }));

  // 加载朝代列表（一次加载全部，不分页）
  const loadDynasties = async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const rsp = await SDynasty.getList({
        pageSize: 10000, // 一次加载全部数据
      });

      if (rsp.success) {
        setState((prev) => ({
          ...prev,
          dynasties: rsp.list,
          loading: false,
        }));
      } else {
        message.error("加载朝代列表失败");
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      message.error("加载朝代列表失败");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  // 添加朝代
  const handleAddDynasty = async () => {
    if (!newDynasty.name.trim()) {
      message.warning("请输入朝代名称");
      return;
    }

    try {
      const rsp = await SDynasty.addItem({
        name: newDynasty.name.trim(),
      });

      if (rsp.success) {
        setNewDynasty({ name: "" });
        handleClose();
        // 根据打开方式调用不同的回调，避免重复调用
        // 如果是从管理作者打开的，只调用 onDynastyAdded 刷新管理作者中的朝代列表
        if (props.onDynastyAdded) {
          await props.onDynastyAdded();
        }
      } else {
        message.error(rsp.msg || "添加失败");
      }
    } catch (error) {
      message.error("添加失败");
    }
  };

  // 删除朝代
  const handleDelete = async (id: string) => {
    try {
      const rsp = await SDynasty.delItem(id);
      if (rsp.success) {
        loadDynasties();
        props.onOk();
      } else {
        message.error(rsp.msg || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  // 移除滚动加载逻辑，一次加载全部数据

  const [editingDynasty, setEditingDynasty] = useState<NDynasty | null>(null);
  const [editName, setEditName] = useState("");

  // 开始编辑
  const handleStartEdit = (dynasty: NDynasty) => {
    setEditingDynasty(dynasty);
    setEditName(dynasty.name);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingDynasty || !editName.trim()) {
      message.warning("请输入朝代名称");
      return;
    }

    try {
      const rsp = await SDynasty.editItem({
        ...editingDynasty,
        name: editName.trim(),
      });

      if (rsp.success) {
        setEditingDynasty(null);
        setEditName("");
        await loadDynasties();
        props.onOk();
      } else {
        message.error(rsp.msg || "修改失败");
      }
    } catch (error) {
      message.error("修改失败");
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingDynasty(null);
    setEditName("");
  };

  const columns: ColumnsType<NDynasty> = [
    {
      title: "朝代",
      key: "name",
      width: 200,
      render: (_, record) => {
        if (editingDynasty && editingDynasty.id === record.id) {
          return (
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onPressEnter={handleSaveEdit}
              onBlur={handleSaveEdit}
              autoFocus
              style={{ width: 150 }}
            />
          );
        }
        return record.name;
      },
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_, record) => {
        if (editingDynasty && editingDynasty.id === record.id) {
          return (
            <Space>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveEdit();
                }}
              >
                保存
              </Button>
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelEdit();
                }}
              >
                取消
              </Button>
            </Space>
          );
        }
        return (
          <Space>
            <Button
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStartEdit(record);
              }}
              style={{
                minWidth: 60,
                paddingLeft: "16px !important",
                paddingRight: "16px !important",
              }}
            >
              修改
            </Button>
            <Button
              danger
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(record.id);
              }}
              style={{ minWidth: 60, paddingLeft: 16, paddingRight: 16 }}
            >
              删除
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleClose = () => {
    setState({ ...defaultState });
  };

  return (
    <Modal
      open={state.open}
      title="管理朝代"
      maskClosable={false}
      onCancel={handleClose}
      footer={[
        <Button key="add" type="primary" onClick={handleAddDynasty}>
          添加
        </Button>,
        <Button key="cancel" onClick={handleClose} style={{ marginLeft: 16 }}>
          关闭
        </Button>,
      ]}
      width={400}
      zIndex={1003}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* 添加朝代 */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>添加朝代：</div>
          <Input
            placeholder="朝代名称"
            value={newDynasty.name}
            onChange={(e) => setNewDynasty({ name: e.target.value })}
            style={{ width: "100%" }}
            onPressEnter={handleAddDynasty}
          />
        </div>

        {/* 朝代列表 */}
        <div
          ref={containerRef}
          style={{
            maxHeight: 400,
            overflowY: "auto",
            border: "1px solid #d9d9d9",
            borderRadius: 4,
          }}
        >
          <Table
            columns={columns}
            dataSource={state.dynasties}
            rowKey="id"
            pagination={false}
            loading={state.loading}
            size="small"
            onRow={() => ({
              onClick: (e) => {
                // 如果点击的是按钮，不处理行点击
                const target = e.target as HTMLElement;
                if (target.closest("button")) {
                  return;
                }
              },
            })}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default forwardRef(DynastyManageModal);
