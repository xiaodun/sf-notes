import React, { useEffect, useState, useRef } from "react";
import { useParams } from "umi";
import { Button, Input, Modal, message, Space, Tag } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, TagsOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import SBehavior from "./SBehavior";
import NBehavior from "./NBehavior";
import NBehaviorRecord from "./NBehaviorRecord";
import NBehaviorTag from "./NBehaviorTag";
import NBehaviorRecordTag from "./NBehaviorRecordTag";
import { verifyPassword, decryptText } from "./utils/encrypt";
import SelfStyle from "./LBehavior.less";
import NRouter from "@/../config/router/NRouter";
import AddRecordModal, { IAddRecordModal } from "./components/AddRecordModal";
import TagManageModal, { ITagManageModal } from "./components/TagManageModal";
import { PageFooter } from "@/common/components/page";
import moment from "moment";
import NRsp from "@/common/namespace/NRsp";

const BehaviorDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const addRecordModalRef = useRef<IAddRecordModal>();
  const behaviorTagModalRef = useRef<ITagManageModal>();
  const passwordInputRef = useRef<any>(null);
  const [behavior, setBehavior] = useState<NBehavior | null>(null);
  const [records, setRecords] = useState<NRsp<NBehaviorRecord>>({
    list: [],
    success: true,
  });
  const [globalTags, setGlobalTags] = useState<NBehaviorTag[]>([]);
  const [behaviorTags, setBehaviorTags] = useState<NBehaviorTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  useEffect(() => {
    loadBehavior();
  }, [params.id]);

  useEffect(() => {
    if (behavior && behavior.encryptedData && !passwordVerified) {
      setPasswordModalVisible(true);
    } else if (behavior && passwordVerified) {
      loadRecords();
      loadTags();
    }
  }, [behavior, passwordVerified]);

  useEffect(() => {
    if (passwordModalVisible && passwordInputRef.current) {
      // 延迟一点确保Modal已经完全渲染
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [passwordModalVisible]);

  const loadBehavior = async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const result = await SBehavior.getItem(params.id);
      if (result.success) {
        // 兼容不同的返回格式
        const behaviorData = (result as any).data || result;
        setBehavior(behaviorData);
        // 如果没有加密数据，直接设置已验证
        if (!behaviorData.encryptedData) {
          setPasswordVerified(true);
        }
      } else {
        message.error("获取行为详情失败");
      }
    } catch (error) {
      message.error("获取行为详情失败");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (!behavior?.encryptedData || !password) {
      message.warning("请输入密码");
      return;
    }

    try {
      const isValid = verifyPassword(behavior.encryptedData, password);
      if (isValid) {
        setPasswordVerified(true);
        setPasswordModalVisible(false);
        message.success("密码验证成功");
      } else {
        message.error("密码错误");
      }
    } catch (error) {
      message.error("密码验证失败");
    }
  };

  const loadRecords = async () => {
    if (!params.id) return;
    try {
      const result = await SBehavior.getRecords(params.id);
      if (result.success) {
        setRecords(result);
      }
    } catch (error) {
      console.error("获取打卡记录失败:", error);
    }
  };

  const loadTags = async () => {
    if (!params.id) return;
    try {
      const [globalResult, behaviorResult] = await Promise.all([
        SBehavior.getGlobalTags(),
        SBehavior.getBehaviorTags(params.id),
      ]);
      if (globalResult.success) {
        setGlobalTags(globalResult.list || []);
      }
      if (behaviorResult.success) {
        setBehaviorTags(behaviorResult.list || []);
      }
    } catch (error) {
      console.error("获取标签失败:", error);
    }
  };

  const handleAddRecord = () => {
    addRecordModalRef.current?.showModal();
  };

  const handleBehaviorTags = () => {
    behaviorTagModalRef.current?.showModal();
  };

  const handleRecordSaveSuccess = async () => {
    await Promise.all([loadRecords(), loadTags()]);
  };

  const handleEditRecord = (record: NBehaviorRecord) => {
    addRecordModalRef.current?.showModal(record);
  };

  const handleDeleteRecord = (record: NBehaviorRecord) => {
    Modal.confirm({
      title: "确认删除",
      content: "确定要删除这条打卡记录吗？",
      onOk: async () => {
        try {
          const result = await SBehavior.delRecord(record.id!);
          if (result.success) {
            await loadRecords();
          } else {
            message.error("删除失败");
          }
        } catch (error) {
          message.error("删除失败");
        }
      },
    });
  };

  const getDecryptedDescription = (record: NBehaviorRecord): string => {
    if (record.encryptedDescription && behavior?.encryptedData && password) {
      try {
        return decryptText(record.encryptedDescription, password);
      } catch (error) {
        return "[解密失败]";
      }
    }
    return record.description || "";
  };

  const getAllTags = (): NBehaviorTag[] => {
    return [...globalTags, ...behaviorTags];
  };

  const getTagDisplayName = (tag: NBehaviorTag): string => {
    if (tag.encryptedName && password && behavior?.encryptedData && !tag.isGlobal) {
      try {
        return decryptText(tag.encryptedName, password);
      } catch (error) {
        return "[解密失败]";
      }
    }
    return tag.name || "";
  };

  const getTimeDiff = (currentTime: number, previousTime: number): string => {
    // previousTime 是更新的记录（时间戳更大），currentTime 是较旧的记录
    // 所以应该用 previousTime - currentTime 来计算时间差
    const diff = previousTime - currentTime;
    const diffMinutes = Math.floor(diff / (1000 * 60));
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const diffMonths = moment(previousTime).diff(moment(currentTime), "months");
    const diffYears = moment(previousTime).diff(moment(currentTime), "years");

    if (diffYears > 0) {
      return `${diffYears}年`;
    } else if (diffMonths > 0) {
      return `${diffMonths}个月`;
    } else if (diffDays > 0) {
      // 计算剩余的小时数（去除天数后的剩余小时）
      const remainingHours = diffHours % 24;
      if (remainingHours >= 1) {
        return `${diffDays}天${remainingHours}小时`;
      }
      return `${diffDays}天`;
    } else if (diffHours > 0) {
      return `${diffHours}小时`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}分钟`;
    } else {
      return "刚刚";
    }
  };

  const getDecryptedTagValue = (recordTag: NBehaviorRecordTag): string => {
    let value: string | number | boolean;
    
    if (recordTag.encryptedValue && behavior?.encryptedData && password) {
      try {
        const decrypted = decryptText(recordTag.encryptedValue, password);
        // 尝试解析为原始类型
        if (decrypted === "true") return "是";
        if (decrypted === "false") return "否";
        return decrypted;
      } catch (error) {
        return "[解密失败]";
      }
    } else {
      value = recordTag.value ?? "";
    }

    if (typeof value === "boolean") {
      return value ? "是" : "否";
    }
    return String(value);
  };

  const renderRecordTags = (record: NBehaviorRecord) => {
    if (!record.tags || record.tags.length === 0) return null;

    const allTags = getAllTags();
    
    return (
      <div className={SelfStyle.recordTags}>
        {record.tags.map((recordTag, idx) => {
          const tag = allTags.find((t) => t.id === recordTag.tagId);
          if (!tag) return null;

          const displayValue = getDecryptedTagValue(recordTag);
          return (
            <Tag key={idx} color="blue">
              {getTagDisplayName(tag)}: {displayValue}
            </Tag>
          );
        })}
      </div>
    );
  };

  const handleBack = () => {
    window.location.href = NRouter.behaviorPath;
  };

  if (loading) {
    return (
      <div className={SelfStyle.detailContainer}>
        <div style={{ textAlign: "center", padding: 40 }}>加载中...</div>
      </div>
    );
  }

  if (!behavior) {
    return (
      <div className={SelfStyle.detailContainer}>
        <div style={{ textAlign: "center", padding: 40 }}>未找到该行为</div>
      </div>
    );
  }

  // 如果有加密数据但未验证，显示密码输入框
  if (behavior.encryptedData && !passwordVerified) {
    return (
      <div className={SelfStyle.detailContainer}>
        <Modal
          title="请输入密码"
          open={passwordModalVisible}
          onOk={handlePasswordSubmit}
          onCancel={handleBack}
          maskClosable={false}
          closable={false}
          centered
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>密码：</div>
              <Input.Password
                ref={passwordInputRef}
                value={password}
                placeholder="请输入密码"
                onChange={(e) => setPassword(e.target.value)}
                onPressEnter={handlePasswordSubmit}
                autoFocus={true}
              />
            </div>
          </Space>
        </Modal>
      </div>
    );
  }

  return (
    <div className={SelfStyle.detailContainer}>
      <div className={SelfStyle.recordsContainer}>
        {records.list && records.list.length > 0 ? (
          <div className={SelfStyle.timelineWrapper}>
            {records.list.map((record, index) => {
              const previousRecord = index > 0 ? records.list[index - 1] : null;
              const timeDiff = previousRecord
                ? getTimeDiff(record.datetime, previousRecord.datetime)
                : null;

              return (
                <div key={record.id || index} className={SelfStyle.timelineItem}>
                  {timeDiff && (
                    <div className={SelfStyle.timelineNode}>
                      <div className={SelfStyle.timeDiffLabel}>{timeDiff}</div>
                      <div className={SelfStyle.timelineDot}></div>
                    </div>
                  )}
                  {!timeDiff && (
                    <div className={SelfStyle.timelineNode}>
                      <div className={SelfStyle.timelineDot}></div>
                    </div>
                  )}
                  <div className={SelfStyle.recordItem}>
                    <div className={SelfStyle.recordHeader}>
                      <div className={SelfStyle.recordHeaderLeft}>
                        <div className={SelfStyle.recordDatetime}>
                          {moment(record.datetime).format("YYYY-MM-DD HH:mm")}
                        </div>
                        {renderRecordTags(record)}
                      </div>
                      <div className={SelfStyle.recordActions}>
                        <Button
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => handleEditRecord(record)}
                        >
                          修改
                        </Button>
                        <Button
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteRecord(record)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                    {getDecryptedDescription(record) && (
                      <div className={SelfStyle.recordDescription}>
                        {getDecryptedDescription(record)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={SelfStyle.emptyState}>
            <p>暂无打卡记录，点击下方按钮添加第一条吧！</p>
          </div>
        )}
      </div>

      <PageFooter>
        <Button
          onClick={handleBack}
          icon={<ArrowLeftOutlined />}
        >
          返回
        </Button>
        <Button
          onClick={handleBehaviorTags}
          icon={<TagsOutlined />}
        >
          标签
        </Button>
        <Button
          type="primary"
          icon={<CheckCircleOutlined />}
          onClick={handleAddRecord}
        >
          打卡
        </Button>
      </PageFooter>

      <AddRecordModal
        behaviorId={params.id || ""}
        isEncrypted={!!behavior?.encryptedData}
        password={password}
        onOk={handleRecordSaveSuccess}
        ref={addRecordModalRef}
      />
      <TagManageModal
        behaviorId={params.id}
        isEncrypted={!!behavior?.encryptedData}
        password={password}
        onOk={handleRecordSaveSuccess}
        ref={behaviorTagModalRef}
      />
    </div>
  );
};

export default BehaviorDetail;

