import React, { useEffect, useRef, useState } from "react";
import SelfStyle from "./LBehavior.less";
import { Button, message, Modal } from "antd";
import { ConnectRC } from "umi";
import NBehavior from "./NBehavior";
import { PageFooter } from "@/common/components/page";
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined } from "@ant-design/icons";
import AddBehaviorModal, { IAddBehaviorModal } from "./components/AddBehaviorModal";
import EditBehaviorModal, { IEditBehaviorModal } from "./components/EditBehaviorModal";
import TagManageModal, { ITagManageModal } from "./components/TagManageModal";
import SBehavior from "./SBehavior";
import NRsp from "@/common/namespace/NRsp";
import NRouter from "@/../config/router/NRouter";

export interface PBehaviorProps {}

const PBehavior: ConnectRC<PBehaviorProps> = (props) => {
  const addModalRef = useRef<IAddBehaviorModal>();
  const editModalRef = useRef<IEditBehaviorModal>();
  const globalTagModalRef = useRef<ITagManageModal>();
  const [rsp, setRsp] = useState<NRsp<NBehavior>>({
    list: [],
    success: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      document.title = "行为";
    });
    reqGetList();
  }, []);

  const reqGetList = async (reset: boolean = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await SBehavior.getList();
      if (result.success) {
        setRsp(result);
      }
    } catch (error) {
      console.error("获取列表失败:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    addModalRef.current?.showModal();
  };

  const handleSaveSuccess = async (behaviorId?: string) => {
    // 刷新列表数据
    await reqGetList(true);
    // 如果提供了ID，跳转到详情页
    if (behaviorId) {
      window.location.href = `${NRouter.behaviorPath}/${behaviorId}`;
    }
  };

  const handleEdit = (e: React.MouseEvent, item: NBehavior) => {
    e.stopPropagation();
    editModalRef.current?.showModal(item);
  };

  const handleDelete = (e: React.MouseEvent, item: NBehavior) => {
    e.stopPropagation();
    Modal.confirm({
      title: "确认删除",
      content: `确定要删除"${item.name}"吗？`,
      onOk: async () => {
        try {
          const result = await SBehavior.delItem(item.id!);
          if (result.success) {
            await reqGetList(true);
          } else {
            message.error("删除失败");
          }
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const handleItemClick = (item: NBehavior) => {
    window.location.href = `${NRouter.behaviorPath}/${item.id}`;
  };

  const handleGlobalTags = () => {
    globalTagModalRef.current?.showModal();
  };

  return (
    <div className={SelfStyle.behaviorContainer}>
      <div className={SelfStyle.listContainer}>
        {rsp.list && rsp.list.length > 0 ? (
          rsp.list.map((item, index) => (
            <div 
              key={item.id || index} 
              className={SelfStyle.behaviorItem}
              onClick={() => handleItemClick(item)}
            >
              <div className={SelfStyle.behaviorHeader}>
                <div className={SelfStyle.behaviorName}>
                  {item.name}
                  {item.encryptedData && (
                    <span className={SelfStyle.encryptedTag}>加密</span>
                  )}
                </div>
                <div className={SelfStyle.behaviorActions}>
                  <Button
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => handleEdit(e, item)}
                  >
                    修改
                  </Button>
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={(e) => handleDelete(e, item)}
                  >
                    删除
                  </Button>
                </div>
              </div>
              <div className={SelfStyle.behaviorTime}>
                {new Date(item.createTime).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className={SelfStyle.emptyState}>
            <p>暂无数据，点击下方按钮添加第一条吧！</p>
          </div>
        )}
      </div>

      <PageFooter>
        <Button
          onClick={handleGlobalTags}
          icon={<TagsOutlined />}
        >
          标签
        </Button>
        <Button
          onClick={handleAdd}
          type="primary"
          icon={<PlusOutlined />}
        >
          添加
        </Button>
      </PageFooter>

      <AddBehaviorModal
        onOk={handleSaveSuccess}
        ref={addModalRef}
        rsp={rsp}
      />
      <EditBehaviorModal
        onOk={handleSaveSuccess}
        ref={editModalRef}
        rsp={rsp}
      />
      <TagManageModal
        onOk={handleSaveSuccess}
        ref={globalTagModalRef}
      />
    </div>
  );
};

export default PBehavior;

