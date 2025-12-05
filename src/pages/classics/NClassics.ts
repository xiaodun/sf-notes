/**
 * 名篇数据模型
 */
export interface NClassics {
  id?: string;
  title: string; // 标题
  authorId: string; // 作者ID
  content: string; // 内容
  createTime: number;
  updateTime: string;
}

export default NClassics;
