import NBehaviorRecord from "../NBehaviorRecord";
import NBehaviorTag from "../NBehaviorTag";
import NBehaviorRecordTag from "../NBehaviorRecordTag";
import {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
} from "react";
import { Modal, Input, Space, message, Select, InputNumber, Switch } from "antd";
import React from "react";
import SBehavior from "../SBehavior";
import { encryptText, decryptText } from "../utils/encrypt";
import moment, { Moment } from "moment";
import { DatePicker } from "antd";
import NRsp from "@/common/namespace/NRsp";

export interface IAddRecordModalProps {
  behaviorId: string;
  isEncrypted: boolean;
  password?: string;
  onOk: () => void;
}

export interface IAddRecordModalState {
  open: boolean;
  editingRecord: NBehaviorRecord | null;
  datetime: Moment | null;
  description: string;
  selectedTags: string[]; // 选中的标签ID列表
  tagValues: Record<string, string | number | boolean>; // 标签值：tagId => value
  globalTags: NBehaviorTag[];
  behaviorTags: NBehaviorTag[];
}

export interface IAddRecordModal {
  showModal: (record?: NBehaviorRecord) => void;
}

const defaultState: IAddRecordModalState = {
  open: false,
  editingRecord: null,
  datetime: moment(),
  description: "",
  selectedTags: [],
  tagValues: {},
  globalTags: [],
  behaviorTags: [],
};

export const AddRecordModal: ForwardRefRenderFunction<
  IAddRecordModal,
  IAddRecordModalProps
> = (props, ref) => {
  const [state, setState] = useState<IAddRecordModalState>(defaultState);

  useImperativeHandle(ref, () => ({
    showModal: async (record?: NBehaviorRecord) => {
      // 先加载标签
      await loadTags();
      
      if (record) {
        // 编辑模式 - 需要解密标签值和描述
        const decryptedTagValues: Record<string, string | number | boolean> = {};
        if (record.tags) {
          for (const tag of record.tags) {
            if (tag.encryptedValue && props.password) {
              try {
                const decrypted = decryptText(tag.encryptedValue, props.password);
                // 尝试解析为原始类型
                if (decrypted === "true") {
                  decryptedTagValues[tag.tagId] = true;
                } else if (decrypted === "false") {
                  decryptedTagValues[tag.tagId] = false;
                } else if (!isNaN(Number(decrypted))) {
                  decryptedTagValues[tag.tagId] = Number(decrypted);
                } else {
                  decryptedTagValues[tag.tagId] = decrypted;
                }
              } catch (e) {
                decryptedTagValues[tag.tagId] = tag.value;
              }
            } else {
              decryptedTagValues[tag.tagId] = tag.value;
            }
          }
        }

        let decryptedDescription = record.description || "";
        if (record.encryptedDescription && props.password) {
          try {
            decryptedDescription = decryptText(record.encryptedDescription, props.password);
          } catch (e) {
            // 保持原值
          }
        }

        setState((prev) => ({
          ...prev,
          open: true,
          editingRecord: record,
          datetime: moment(record.datetime),
          description: decryptedDescription,
          selectedTags: record.tags?.map((t) => t.tagId) || [],
          tagValues: decryptedTagValues,
        }));
      } else {
        // 新建模式
        setState((prev) => ({
          ...prev,
          open: true,
          editingRecord: null,
        }));
      }
    },
  }));

  const loadTags = async () => {
    try {
      const [globalResult, behaviorResult] = await Promise.all([
        SBehavior.getGlobalTags(),
        SBehavior.getBehaviorTags(props.behaviorId),
      ]);

      setState((prev) => ({
        ...prev,
        globalTags: globalResult.success ? globalResult.list || [] : [],
        behaviorTags: behaviorResult.success ? behaviorResult.list || [] : [],
      }));
    } catch (error) {
      console.error("加载标签失败:", error);
    }
  };

  const getAllTags = (): NBehaviorTag[] => {
    return [...state.globalTags, ...state.behaviorTags];
  };

  const getTagDisplayName = (tag: NBehaviorTag): string => {
    if (tag.encryptedName && props.password && props.isEncrypted && !tag.isGlobal) {
      try {
        return decryptText(tag.encryptedName, props.password);
      } catch (error) {
        return "[解密失败]";
      }
    }
    return tag.name || "";
  };

  async function onOk() {
    if (!state.datetime) {
      message.warning("请选择日期时间");
      return;
    }

    // 处理标签值
    const tags: NBehaviorRecordTag[] = [];
    const allTags = getAllTags();

    for (const tagId of state.selectedTags) {
      const tag = allTags.find((t) => t.id === tagId);
      if (!tag) continue;

      let value: string | number | boolean;
      if (tag.type === "number") {
        value = (state.tagValues[tagId] as number) || 1;
      } else {
        value = state.tagValues[tagId] as boolean ?? false;
      }

      const recordTag: NBehaviorRecordTag = {
        tagId,
        value,
      };

      // 如果行为是加密的，则对标签值进行加密
      if (props.isEncrypted && props.password) {
        try {
          recordTag.encryptedValue = encryptText(String(value), props.password);
          // 清空明文值，只保留加密值
          recordTag.value = undefined;
        } catch (error) {
          message.error("加密标签值失败");
          return;
        }
      }

      tags.push(recordTag);
    }

    const isEdit = !!state.editingRecord;
    const recordData: NBehaviorRecord = {
      id: state.editingRecord?.id,
      behaviorId: props.behaviorId,
      datetime: state.datetime.valueOf(),
      description: state.description.trim(),
      tags,
      createTime: state.editingRecord?.createTime || Date.now(),
      updateTime: new Date().toISOString(),
    };

    // 如果行为是加密的，则对描述进行加密
    if (props.isEncrypted && props.password) {
      try {
        recordData.encryptedDescription = encryptText(recordData.description, props.password);
        recordData.description = ""; // 清空明文描述
      } catch (error) {
        message.error("加密失败");
        return;
      }
    }

    const response = isEdit
      ? await SBehavior.editRecord(recordData)
      : await SBehavior.addRecord(recordData);
    if (response.success) {
      onClose();
      props.onOk();
    } else {
      message.error((response as any).msg || "操作失败");
    }
  }

  function onClose() {
    setState({ ...defaultState });
  }

  return (
    <Modal
      open={state.open}
      title={state.editingRecord ? "修改打卡" : "打卡"}
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
            日期时间：
          </div>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm"
            value={state.datetime}
            onChange={(date) => {
              setState((prev) => ({
                ...prev,
                datetime: date || moment(),
              }));
            }}
            style={{ width: "100%" }}
            placeholder="请选择日期时间"
          />
        </div>
        <div>
          <div
            style={{
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            标签：
          </div>
          <Select
            mode="multiple"
            placeholder="请选择标签"
            value={state.selectedTags}
            style={{ width: "100%" }}
            onChange={(values) => {
              const allTags = getAllTags();
              const newTagValues = { ...state.tagValues };
              
              // 移除未选中的标签值
              Object.keys(newTagValues).forEach((tagId) => {
                if (!values.includes(tagId)) {
                  delete newTagValues[tagId];
                }
              });

              // 为新选中的标签设置默认值
              values.forEach((tagId) => {
                if (!newTagValues.hasOwnProperty(tagId)) {
                  const tag = allTags.find((t) => t.id === tagId);
                  if (tag) {
                    if (tag.type === "number") {
                      newTagValues[tagId] = 1;
                    } else {
                      newTagValues[tagId] = false;
                    }
                  }
                }
              });

              setState((prev) => ({
                ...prev,
                selectedTags: values,
                tagValues: newTagValues,
              }));
            }}
          >
            {state.globalTags.map((tag) => (
              <Select.Option key={tag.id} value={tag.id}>
                [全局] {tag.name}
              </Select.Option>
            ))}
            {state.behaviorTags.map((tag) => (
              <Select.Option key={tag.id} value={tag.id}>
                {getTagDisplayName(tag)}
              </Select.Option>
            ))}
          </Select>
        </div>

        {state.selectedTags.length > 0 && (
          <div>
            {state.selectedTags.map((tagId) => {
              const tag = getAllTags().find((t) => t.id === tagId);
              if (!tag) return null;

              return (
                <div key={tagId} style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 4, fontWeight: 500 }}>{getTagDisplayName(tag)}：</div>
                  {tag.type === "number" ? (
                    <InputNumber
                      value={state.tagValues[tagId] as number}
                      style={{ width: "100%" }}
                      placeholder="请输入数值"
                      min={1}
                      onChange={(value) => {
                        setState((prev) => ({
                          ...prev,
                          tagValues: {
                            ...prev.tagValues,
                            [tagId]: value || 1,
                          },
                        }));
                      }}
                    />
                  ) : (
                    <Switch
                      checked={state.tagValues[tagId] as boolean}
                      onChange={(checked) => {
                        setState((prev) => ({
                          ...prev,
                          tagValues: {
                            ...prev.tagValues,
                            [tagId]: checked,
                          },
                        }));
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div>
          <div
            style={{
              marginBottom: 8,
              fontWeight: 500,
            }}
          >
            描述：
          </div>
          <Input.TextArea
            value={state.description}
            placeholder="请输入描述"
            rows={4}
            onChange={(e) => {
              const value = e?.target?.value || "";
              setState((prev) => ({
                ...prev,
                description: value,
              }));
            }}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default forwardRef(AddRecordModal);

