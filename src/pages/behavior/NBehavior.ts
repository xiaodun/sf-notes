export interface NBehavior {
  name: string; // 活动名称
  encryptedData?: string; // 加密后的"加密"字符串（如果存在则表示已加密）
  createTime: number;
  id?: string;
  updateTime: string;
}

export default NBehavior;

