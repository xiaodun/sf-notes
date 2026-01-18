import NBehaviorTag from "./NBehaviorTag";
import NBehaviorRecord from "./NBehaviorRecord";

export interface NBehavior {
  name: string; // 活动名称（如果加密行为，此字段可能为加密后的名称或占位符）
  encryptedName?: string; // 加密后的行为名称（如果存在则表示名称已加密）
  encryptedData?: string; // 加密后的"加密"字符串（如果存在则表示已加密）
  createTime: number; // 创建时间（如果已加密，此字段可能为占位符）
  encryptedCreateTime?: string; // 加密后的创建时间（如果存在则表示已加密）
  id?: string;
  updateTime: string; // 更新时间（如果已加密，此字段可能为占位符）
  encryptedUpdateTime?: string; // 加密后的更新时间（如果存在则表示已加密）
  tags?: NBehaviorTag[]; // 该行为的标签
  records?: NBehaviorRecord[]; // 该行为的打卡记录
}

export default NBehavior;

