export interface NBehaviorTag {
  id?: string;
  name: string; // 标签名称
  type: "number" | "boolean"; // 类型：数值、是否
  isGlobal?: boolean; // 是否全局标签
  behaviorId?: string; // 如果不是全局标签，关联的行为ID
  createTime: number;
  updateTime: string;
}

export default NBehaviorTag;

