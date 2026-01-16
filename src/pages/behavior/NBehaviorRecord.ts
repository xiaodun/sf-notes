import NBehaviorRecordTag from "./NBehaviorRecordTag";

export interface NBehaviorRecord {
  id?: string;
  behaviorId: string; // 关联的行为ID
  datetime: number; // 打卡时间（时间戳）
  description: string; // 描述（可能加密）
  encryptedDescription?: string; // 加密后的描述（如果存在则表示已加密）
  tags?: NBehaviorRecordTag[]; // 标签值列表
  createTime: number;
  updateTime: string;
}

export default NBehaviorRecord;

