export interface NNotes {
  content: string;
  base64: Object;
  createTime: number;
  id?: string;
  updateTime: string;
  title: string;
  titleColor?: string;
  /** 仅回收站列表接口会带上 */
  deleted?: boolean;
}
export namespace NNotes {
  export const imgProtocolKey = "base64img";
}
export default NNotes;
