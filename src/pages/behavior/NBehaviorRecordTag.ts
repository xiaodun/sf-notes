export interface NBehaviorRecordTag {
  tagId: string; // 标签ID
  value?: string | number | boolean; // 标签值（数值类型是number，是否类型是boolean），加密行为中可能为空
  encryptedValue?: string; // 加密后的值（如果行为是加密的）
}

export default NBehaviorRecordTag;

