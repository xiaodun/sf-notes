import NAuthor from "../NAuthor";
import NDynasty from "../NDynasty";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useRef,
} from "react";
import { Modal, Input, Space, Button, Table, message, Select } from "antd";
import React from "react";
import SAuthor from "../SAuthor";
import SDynasty from "../SDynasty";
import NRsp from "@/common/namespace/NRsp";
import type { ColumnsType } from "antd/es/table";
import NModel from "@/common/namespace/NModel";
import { NMDClassics } from "../models/MDClassics";
// 移除分页逻辑，一次加载全部数据

export interface IAuthorManageModalProps {
  onOk: () => void;
  onOpenDynastyModal?: () => void; // 打开朝代管理模态框的回调
  onDynastyAdded?: () => void; // 朝代添加后的回调，用于刷新朝代列表
  MDClassics: NMDClassics.IState; // 从父组件传递的 MDClassics 数据
  onAuthorAdded?: (authorId: string) => void; // 作者添加后的回调，返回新创建的作者ID
  onDynastyAddedWithId?: (dynastyId: string) => void; // 朝代添加后的回调，返回新创建的朝代ID（用于从管理作者打开时）
}

export interface IAuthorManageModalState {
  open: boolean;
  authors: NAuthor[];
  loading: boolean;
}

export interface IAuthorManageModal {
  showModal: () => void;
  refreshDynasties: () => Promise<void>; // 刷新朝代列表
  setDynastyId?: (dynastyId: string) => void; // 设置朝代ID的方法
}

const defaultState: IAuthorManageModalState = {
  open: false,
  authors: [],
  loading: false,
};

const AuthorManageModalComponent: ForwardRefRenderFunction<
  IAuthorManageModal,
  IAuthorManageModalProps
> = (props, ref) => {
  const [state, setState] =
    useState<Partial<IAuthorManageModalState>>(defaultState);
  const [newAuthor, setNewAuthor] = useState({ name: "", dynastyId: "" });
  const containerRef = useRef<HTMLDivElement>(null);
  const authorNameInputRef = useRef<any>(null);

  // 从 props 获取 MDClassics 数据
  const { MDClassics } = props;
  // 从 MDClassics 获取朝代数据
  const dynasties = MDClassics.dynasties;

  // 防止重复加载的标志
  const loadingRef = useRef<{ dynasties: boolean; authors: boolean }>({
    dynasties: false,
    authors: false,
  });

  useImperativeHandle(ref, () => ({
    showModal: () => {
      setState({
        ...defaultState,
        open: true,
      });
      // 打开时总是加载朝代和作者数据，确保下拉框有数据
      // 如果 MDClassics 中已有数据，直接使用；否则加载
      if (dynasties.length === 0) {
        loadDynasties();
      }
      if (MDClassics.authors.length === 0) {
        loadAuthors();
      } else {
        // 如果已有数据，直接设置到本地 state
        setState((prev) => ({ ...prev, authors: MDClassics.authors }));
      }
      // 使用 setTimeout 确保模态框已渲染后再聚焦
      setTimeout(() => {
        authorNameInputRef.current?.focus();
      }, 100);
    },
    refreshDynasties: async () => {
      // 刷新朝代列表，更新到 MDClassics
      await loadDynasties();
    },
    setDynastyId: (dynastyId: string) => {
      // 设置朝代ID，用于在添加作者时自动选择该朝代
      if (dynastyId) {
        setNewAuthor((prev) => ({ ...prev, dynastyId }));
      }
    },
  }));

  // 加载朝代列表 - 独立的函数，确保总是能获取到数据，更新到 MDClassics
  const loadDynasties = async () => {
    // 防止重复加载
    if (loadingRef.current.dynasties) {
      return;
    }
    loadingRef.current.dynasties = true;
    NModel.dispatch(new NMDClassics.ARSetDynastiesLoading(true));
    try {
      const rsp = await SDynasty.getList({ pageSize: 10000 });
      if (rsp.success) {
        NModel.dispatch(new NMDClassics.ARSetDynasties(rsp.list));
      }
    } catch (error) {
      // 加载失败已在UI中提示
    } finally {
      loadingRef.current.dynasties = false;
      NModel.dispatch(new NMDClassics.ARSetDynastiesLoading(false));
    }
  };

  // 移除定期刷新逻辑，只在打开时加载一次

  // 加载作者列表（一次加载全部，不分页），更新到 MDClassics
  const loadAuthors = async () => {
    // 防止重复加载
    if (loadingRef.current.authors) {
      return;
    }
    loadingRef.current.authors = true;
    setState((prev) => ({ ...prev, loading: true }));
    NModel.dispatch(new NMDClassics.ARSetAuthorsLoading(true));
    try {
      const rsp = await SAuthor.getList({
        pageSize: 10000, // 一次加载全部数据
      });

      if (rsp.success) {
        NModel.dispatch(new NMDClassics.ARSetAuthors(rsp.list));
        setState((prev) => ({
          ...prev,
          authors: rsp.list,
          loading: false,
        }));
      } else {
        message.error("加载作者列表失败");
        setState((prev) => ({ ...prev, loading: false }));
      }
    } catch (error) {
      message.error("加载作者列表失败");
      setState((prev) => ({ ...prev, loading: false }));
    } finally {
      loadingRef.current.authors = false;
      NModel.dispatch(new NMDClassics.ARSetAuthorsLoading(false));
    }
  };

  // 添加作者
  const handleAddAuthor = async () => {
    if (!newAuthor.name.trim()) {
      message.warning("请输入作者姓名");
      return;
    }
    if (!newAuthor.dynastyId) {
      message.warning("请选择朝代");
      return;
    }

    try {
      const rsp = await SAuthor.addItem({
        name: newAuthor.name.trim(),
        dynastyId: newAuthor.dynastyId,
      });

      if (rsp.success) {
        // 获取新创建的作者ID
        // 根据日志，rsp 对象本身可能包含 id 字段，或者 rsp.data 包含
        const newAuthor = (rsp.data as NAuthor) || (rsp as any);
        const newAuthorId = newAuthor?.id || (rsp as any)?.id || "";
        setNewAuthor({ name: "", dynastyId: "" });
        // 刷新作者列表，更新到 MDClassics
        if (!loadingRef.current.authors) {
          loadingRef.current.authors = true;
          await loadAuthors().finally(() => {
            loadingRef.current.authors = false;
          });
        }
        props.onOk();
        // 添加后自动关闭
        handleClose();
        // 如果有回调，通知父组件新创建的作者ID（在列表刷新后）
        if (props.onAuthorAdded && newAuthorId) {
          // 等待一下确保数据已更新到MDClassics和EditModal的props
          setTimeout(() => {
            props.onAuthorAdded?.(newAuthorId);
          }, 300); // 增加延迟确保数据已刷新
        } else if (props.onAuthorAdded && (rsp as any)?.id) {
          // 如果 newAuthorId 为空，但 rsp 有 id，尝试使用 rsp.id
          const fallbackId = (rsp as any).id;
          setTimeout(() => {
            props.onAuthorAdded?.(fallbackId);
          }, 300);
        }
      } else {
        message.error(rsp.msg || "添加失败");
      }
    } catch (error) {
      message.error("添加失败");
    }
  };

  // 删除作者
  const handleDelete = async (id: string) => {
    try {
      const rsp = await SAuthor.delItem(id);
      if (rsp.success) {
        // 立即从本地 state 中移除该项
        setState((prev) => ({
          ...prev,
          authors: (prev.authors || []).filter((author) => author.id !== id),
        }));

        // 同时更新 MDClassics 中的作者列表
        const updatedAuthors = (state.authors || []).filter(
          (author) => author.id !== id
        );
        NModel.dispatch(new NMDClassics.ARSetAuthors(updatedAuthors));

        // 刷新作者列表，确保数据同步
        if (!loadingRef.current.authors) {
          loadingRef.current.authors = true;
          loadAuthors().finally(() => {
            loadingRef.current.authors = false;
          });
        }
        props.onOk();
      } else {
        message.error(rsp.msg || "删除失败");
      }
    } catch (error) {
      message.error("删除失败");
    }
  };

  // 移除滚动加载逻辑，一次加载全部数据

  const getDynastyName = (dynastyId: string) => {
    const dynasty = dynasties.find((d) => d.id === dynastyId);
    return dynasty ? dynasty.name : "未知朝代";
  };

  const [editingAuthor, setEditingAuthor] = useState<NAuthor | null>(null);
  const [editAuthorName, setEditAuthorName] = useState("");
  const [editAuthorDynastyId, setEditAuthorDynastyId] = useState("");

  // 开始编辑
  const handleStartEdit = (author: NAuthor) => {
    setEditingAuthor(author);
    setEditAuthorName(author.name);
    setEditAuthorDynastyId(author.dynastyId);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!editingAuthor || !editAuthorName.trim()) {
      message.warning("请输入作者姓名");
      return;
    }
    if (!editAuthorDynastyId) {
      message.warning("请选择朝代");
      return;
    }

    try {
      const rsp = await SAuthor.editItem({
        ...editingAuthor,
        name: editAuthorName.trim(),
        dynastyId: editAuthorDynastyId,
      });

      if (rsp.success) {
        setEditingAuthor(null);
        setEditAuthorName("");
        setEditAuthorDynastyId("");
        await loadAuthors();
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
    setEditingAuthor(null);
    setEditAuthorName("");
    setEditAuthorDynastyId("");
  };

  const columns: ColumnsType<NAuthor> = [
    {
      title: "作者",
      key: "name",
      width: 150,
      render: (_, record) => {
        if (editingAuthor && editingAuthor.id === record.id) {
          return (
            <Input
              value={editAuthorName}
              onChange={(e) => setEditAuthorName(e.target.value)}
              style={{ width: 120 }}
            />
          );
        }
        return record.name;
      },
    },
    {
      title: "朝代",
      key: "dynasty",
      width: 150,
      render: (_, record) => {
        if (editingAuthor && editingAuthor.id === record.id) {
          return (
            <Select
              value={editAuthorDynastyId || undefined}
              onChange={(value) => setEditAuthorDynastyId(value)}
              style={{ width: 120 }}
              options={dynasties.map((dynasty) => ({
                label: dynasty.name,
                value: dynasty.id,
              }))}
            />
          );
        }
        return getDynastyName(record.dynastyId);
      },
    },
    {
      title: "操作",
      key: "action",
      width: 150,
      render: (_, record) => {
        if (editingAuthor && editingAuthor.id === record.id) {
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
      title="管理作者"
      maskClosable={false}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          关闭
        </Button>,
      ]}
      width={600}
      zIndex={1002}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {/* 添加作者 */}
        <div>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>添加作者：</div>
          <Space wrap style={{ width: "100%" }}>
            <Input
              ref={authorNameInputRef}
              placeholder="作者姓名"
              value={newAuthor.name}
              onChange={(e) =>
                setNewAuthor({ ...newAuthor, name: e.target.value })
              }
              style={{ width: 150 }}
            />
            <Select
              placeholder="选择朝代"
              value={newAuthor.dynastyId || undefined}
              onChange={(value) =>
                setNewAuthor({ ...newAuthor, dynastyId: value })
              }
              style={{ width: 100 }}
              options={dynasties.map((dynasty) => ({
                label: dynasty.name,
                value: dynasty.id,
              }))}
            />
            <Button
              onClick={() => {
                if (props.onOpenDynastyModal) {
                  props.onOpenDynastyModal();
                }
              }}
            >
              添加朝代
            </Button>
            <Button type="primary" onClick={handleAddAuthor}>
              添加
            </Button>
          </Space>
        </div>

        {/* 作者列表 */}
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
            dataSource={state.authors}
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

const AuthorManageModal = forwardRef<
  IAuthorManageModal,
  IAuthorManageModalProps
>(AuthorManageModalComponent);

AuthorManageModal.displayName = "AuthorManageModal";

export default AuthorManageModal;
