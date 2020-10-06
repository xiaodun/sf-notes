export interface NNotes {
  content: string;
  base64: Object;
  createTime: number;
  id?: string;
  updateTime: string;
  title: string;
}
export namespace NNotes {
  export const imgProtocolKey = 'base64img';
}
export default NNotes;
