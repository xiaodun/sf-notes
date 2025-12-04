export interface NJokes {
  upperContent: string; // 上段内容
  lowerContent?: string; // 下段内容（可选）
  base64?: Object; // 图片base64数据
  createTime: number;
  id?: string;
  updateTime: string;
}
export namespace NJokes {
  export const imgProtocolKey = "base64img";
}
export default NJokes;
