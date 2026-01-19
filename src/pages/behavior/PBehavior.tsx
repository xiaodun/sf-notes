import React, { useEffect, useRef, useState } from "react";
import SelfStyle from "./LBehavior.less";
import { Button, message, Modal, Input } from "antd";
import { ConnectRC } from "umi";
import NBehavior from "./NBehavior";
import { PageFooter } from "@/common/components/page";
import { PlusOutlined, EditOutlined, DeleteOutlined, TagsOutlined, LockOutlined } from "@ant-design/icons";
import AddBehaviorModal, { IAddBehaviorModal } from "./components/AddBehaviorModal";
import EditBehaviorModal, { IEditBehaviorModal } from "./components/EditBehaviorModal";
import TagManageModal, { ITagManageModal } from "./components/TagManageModal";
import PasswordInputModal, { IPasswordInputModal } from "./components/PasswordInputModal";
import SBehavior from "./SBehavior";
import NRsp from "@/common/namespace/NRsp";
import NRouter from "@/../config/router/NRouter";
import { decryptText } from "./utils/encrypt";
import passwordManager from "./utils/passwordManager";

export interface PBehaviorProps {}

const PBehavior: ConnectRC<PBehaviorProps> = (props) => {
  const addModalRef = useRef<IAddBehaviorModal>();
  const editModalRef = useRef<IEditBehaviorModal>();
  const globalTagModalRef = useRef<ITagManageModal>();
  const passwordModalRef = useRef<IPasswordInputModal>();
  const [rsp, setRsp] = useState<NRsp<NBehavior>>({
    list: [],
    success: true,
  });
  const [loading, setLoading] = useState(false);
  const [showEncrypted, setShowEncrypted] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    setTimeout(() => {
      document.title = "行为";
    });
    reqGetList();

    // 监听路由变化，离开行为路由时清空密码
    let unlisten: (() => void) | undefined;
    if (window.umiHistory && typeof window.umiHistory.listen === 'function') {
      unlisten = window.umiHistory.listen((location: any, action: any) => {
        const pathname = location?.pathname || location?.path || "";
        // 如果路由不是行为相关路由，清空密码
        if (pathname && !pathname.startsWith(NRouter.behaviorPath)) {
          passwordManager.clearPassword();
        }
      });
    }

    // 监听页面可见性变化，页面变为可见时检查密码是否过期
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // 检查密码是否过期，如果过期会自动清空
        const wasVerified = passwordManager.isVerified();
        if (!wasVerified && showEncrypted) {
          // 如果密码已过期且当前显示加密行为，则隐藏加密行为
          setShowEncrypted(false);
          setPassword("");
        }
      }
    };

    // 监听窗口焦点变化，窗口获得焦点时检查密码是否过期
    const handleFocus = () => {
      const wasVerified = passwordManager.isVerified();
      if (!wasVerified && showEncrypted) {
        // 如果密码已过期且当前显示加密行为，则隐藏加密行为
        setShowEncrypted(false);
        setPassword("");
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (unlisten) {
        unlisten();
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [showEncrypted]);


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

  const handleSaveSuccess = async () => {
    // 刷新列表数据
    await reqGetList(true);
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
    if (window.umiHistory) {
      window.umiHistory.push(`${NRouter.behaviorPath}/${item.id}`);
    } else {
      window.location.href = `${NRouter.behaviorPath}/${item.id}`;
    }
  };

  const handleGlobalTags = () => {
    globalTagModalRef.current?.showModal();
  };

  // 处理展示加密笔记按钮点击
  const handleShowEncrypted = () => {
    if (showEncrypted) {
      // 如果已经显示，则隐藏（不清空全局密码）
      setShowEncrypted(false);
    } else {
      // 检查全局密码管理器
      if (passwordManager.isVerified()) {
        // 直接使用全局密码，不验证
        setPassword(passwordManager.getPassword());
        setShowEncrypted(true);
      } else {
        // 需要输入密码
        passwordModalRef.current?.show();
      }
    }
  };

  // 验证密码并显示加密笔记
  const handlePasswordSubmit = (inputPassword: string) => {
    // 检查是否有加密行为
    const hasEncrypted = rsp.list.some(item => item.encryptedData);
    if (!hasEncrypted) {
      message.warning("当前没有加密的行为");
      return;
    }

    // 直接使用用户输入的密码，不验证
    passwordManager.setPassword(inputPassword);
    setPassword(inputPassword);
    setShowEncrypted(true);
  };

  // 检查全局密码管理器是否有已验证的密码
  useEffect(() => {
    if (passwordManager.isVerified()) {
      // 直接使用全局密码，不验证
      setPassword(passwordManager.getPassword());
      setShowEncrypted(true);
    }
  }, [rsp.list]);

  // 获取显示的行为列表（根据showEncrypted过滤）
  const getDisplayList = (): NBehavior[] => {
    if (showEncrypted) {
      // 显示所有行为，并对加密的行为名称和创建时间进行解密
      return rsp.list.map(item => {
        if (item.encryptedData && item.encryptedName && password) {
          try {
            const decryptedName = decryptText(item.encryptedName, password);
            let decryptedItem: any = { ...item, name: decryptedName };
            // 解密 createTime
            if (item.encryptedCreateTime) {
              try {
                const decryptedCreateTime = decryptText(item.encryptedCreateTime, password);
                decryptedItem.createTime = Number(decryptedCreateTime) || item.createTime;
              } catch (error) {
                // 解密失败，保留原值
              }
            }
            return decryptedItem;
          } catch (error) {
            return { ...item, name: "***" }; // 解密失败显示占位符
          }
        }
        return item;
      });
    } else {
      // 只显示非加密的行为
      return rsp.list.filter(item => !item.encryptedData);
    }
  };

  // 判断是否至少有一个加密行为
  const hasEncryptedBehaviors = rsp.list.some(item => item.encryptedData);

  const displayList = getDisplayList();

  return (
    <div className={SelfStyle.behaviorContainer}>
      <div className={SelfStyle.listContainer}>
        {displayList && displayList.length > 0 ? (
          displayList.map((item, index) => (
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
        {hasEncryptedBehaviors && (
          <Button
            onClick={handleShowEncrypted}
            icon={<LockOutlined />}
            type={showEncrypted ? "default" : "dashed"}
          >
            {showEncrypted ? "隐藏加密笔记" : "展示加密笔记"}
          </Button>
        )}
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

      <PasswordInputModal
        ref={passwordModalRef}
        title="验证密码"
        onOk={handlePasswordSubmit}
      />

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

