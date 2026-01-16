export interface NBehaviorTag {
  id?: string;
  name?: string; // 标签名称（明文）
  encryptedName?: string; // 加密后的标签名称（如果存在则表示已加密）
  type: "number" | "boolean"; // 类型：数值、是否
  isGlobal?: boolean; // 是否全局标签
  behaviorId?: string; // 如果不是全局标签，关联的行为ID
  createTime: number;
  updateTime: string;
}

export default NBehaviorTag;

