import NBehaviorTag from "./NBehaviorTag";
import NBehaviorRecord from "./NBehaviorRecord";

export interface NBehavior {
  name: string; // 活动名称
  encryptedData?: string; // 加密后的"加密"字符串（如果存在则表示已加密）
  createTime: number;
  id?: string;
  updateTime: string;
  tags?: NBehaviorTag[]; // 该行为的标签
  records?: NBehaviorRecord[]; // 该行为的打卡记录
}

export default NBehavior;

