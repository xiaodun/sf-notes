import React, { useEffect, useState, useRef } from "react";
import { useParams } from "umi";
import { Button, Input, Modal, message, Space, Tag } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined, TagsOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import SBehavior from "./SBehavior";
import NBehavior from "./NBehavior";
import NBehaviorRecord from "./NBehaviorRecord";
import NBehaviorTag from "./NBehaviorTag";
import NBehaviorRecordTag from "./NBehaviorRecordTag";
import { decryptText } from "./utils/encrypt";
import SelfStyle from "./LBehavior.less";
import NRouter from "@/../config/router/NRouter";
import AddRecordModal, { IAddRecordModal } from "./components/AddRecordModal";
import TagManageModal, { ITagManageModal } from "./components/TagManageModal";
import PasswordInputModal, { IPasswordInputModal } from "./components/PasswordInputModal";
import { PageFooter } from "@/common/components/page";
import moment from "moment";
import NRsp from "@/common/namespace/NRsp";
import passwordManager from "./utils/passwordManager";

const BehaviorDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const addRecordModalRef = useRef<IAddRecordModal>();
  const behaviorTagModalRef = useRef<ITagManageModal>();
  const passwordModalRef = useRef<IPasswordInputModal>();
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

  useEffect(() => {
    loadBehavior();
  }, [params.id]);

  useEffect(() => {
    if (behavior && behavior.encryptedData && !passwordVerified) {
      // 检查全局密码管理器是否有已验证的密码
      if (passwordManager.isVerified()) {
        // 直接使用全局密码，不验证
        setPassword(passwordManager.getPassword());
        setPasswordVerified(true);
      } else {
        // 延迟显示密码输入框，确保 PasswordInputModal 已经渲染完成
        setTimeout(() => {
          passwordModalRef.current?.show();
        }, 100);
      }
    } else if (behavior && passwordVerified) {
      loadRecords();
      loadTags();
    }
  }, [behavior, passwordVerified]);


  const loadBehavior = async () => {
    if (!params.id) return;
    setLoading(true);
    try {
      const result = await SBehavior.getItem(params.id);
      if (result.success) {
        // 兼容不同的返回格式
        const behaviorData = (result as any).data?.data || (result as any).data || result;
        setBehavior(behaviorData);
        // 如果没有加密数据，直接设置已验证
        if (!behaviorData.encryptedData) {
          setPasswordVerified(true);
          
          // 如果行为是不加密的，但记录或标签还是加密状态，需要解密并更新
          const hasEncryptedRecords = behaviorData.records?.some((r: any) => r.encryptedDescription);
          const hasEncryptedTags = behaviorData.tags?.some((t: any) => t.encryptedName);
          
          if ((hasEncryptedRecords || hasEncryptedTags) && passwordManager.isVerified()) {
            const password = passwordManager.getPassword();
            let needUpdate = false;
            const updatedBehavior: any = { ...behaviorData };
            
            // 解密记录
            if (hasEncryptedRecords && updatedBehavior.records) {
              updatedBehavior.records = updatedBehavior.records.map((record: any) => {
                const updatedRecord = { ...record };
                if (record.encryptedDescription) {
                  try {
                    updatedRecord.description = decryptText(record.encryptedDescription, password);
                    delete updatedRecord.encryptedDescription;
                    needUpdate = true;
                  } catch (error) {
                    // 解密失败，跳过
                  }
                }
                // 解密记录中的标签值
                if (record.tags && record.tags.length > 0) {
                  updatedRecord.tags = record.tags.map((tag: any) => {
                    if (tag.encryptedValue) {
                      try {
                        const decryptedValueStr = decryptText(tag.encryptedValue, password);
                        // 尝试解析为 number 或 boolean，如果失败则保持字符串
                        let decryptedValue: string | number | boolean = decryptedValueStr;
                        if (decryptedValueStr === "true") {
                          decryptedValue = true;
                        } else if (decryptedValueStr === "false") {
                          decryptedValue = false;
                        } else {
                          const numValue = Number(decryptedValueStr);
                          if (!isNaN(numValue)) {
                            decryptedValue = numValue;
                          }
                        }
                        return {
                          ...tag,
                          value: decryptedValue,
                          encryptedValue: undefined,
                        };
                      } catch (error) {
                        return tag;
                      }
                    }
                    return tag;
                  });
                }
                return updatedRecord;
              });
            }
            
            // 解密标签
            if (hasEncryptedTags && updatedBehavior.tags) {
              updatedBehavior.tags = updatedBehavior.tags.map((tag: any) => {
                const updatedTag = { ...tag };
                if (tag.encryptedName) {
                  try {
                    updatedTag.name = decryptText(tag.encryptedName, password);
                    delete updatedTag.encryptedName;
                    needUpdate = true;
                  } catch (error) {
                    // 解密失败，跳过
                  }
                }
                return updatedTag;
              });
            }
            
            // 如果需要更新，保存解密后的数据
            if (needUpdate) {
              const updateData: any = {
                id: updatedBehavior.id,
                name: updatedBehavior.name,
                createTime: updatedBehavior.createTime,
                updateTime: new Date().toISOString(),
              };
              if (updatedBehavior.records) {
                updateData.records = updatedBehavior.records;
              }
              if (updatedBehavior.tags) {
                updateData.tags = updatedBehavior.tags;
              }
              await SBehavior.editItem(updateData);
              // 重新加载行为数据
              const reloadResult = await SBehavior.getItem(params.id);
              if (reloadResult.success) {
                const reloadedData = (reloadResult as any).data?.data || (reloadResult as any).data || reloadResult;
                setBehavior(reloadedData);
              }
            }
          }
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

  const handlePasswordSubmit = (inputPassword: string) => {
    // 直接使用用户输入的密码，不验证
    passwordManager.setPassword(inputPassword);
    setPassword(inputPassword);
    setPasswordVerified(true);
    // 立即加载记录和标签（loadRecords 和 loadTags 内部会检查 params.id）
    loadRecords();
    loadTags();
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
    if (window.umiHistory) {
      window.umiHistory.push(NRouter.behaviorPath);
    } else {
      window.location.href = NRouter.behaviorPath;
    }
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

  return (
    <div className={SelfStyle.detailContainer}>
      {/* 如果有加密数据但未验证，不显示内容 */}
      {(!behavior.encryptedData || passwordVerified) && (
        <>
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
        </>
      )}

      <AddRecordModal
        behaviorId={params.id || ""}
        isEncrypted={!!behavior?.encryptedData}
        password={password || passwordManager.getPassword()}
        onOk={handleRecordSaveSuccess}
        ref={addRecordModalRef}
      />
      <TagManageModal
        behaviorId={params.id}
        isEncrypted={!!behavior?.encryptedData}
        password={password || passwordManager.getPassword()}
        onOk={handleRecordSaveSuccess}
        ref={behaviorTagModalRef}
      />
      <PasswordInputModal
        ref={passwordModalRef}
        title="请输入密码"
        onOk={handlePasswordSubmit}
      />
    </div>
  );
};

export default BehaviorDetail;

