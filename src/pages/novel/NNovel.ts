export interface NNovel {
  name: string; // 小说名称
  path: string; // 小说文件路径（文件夹路径，章节文件在该文件夹下）
  currentChapter?: number; // 当前阅读到的章节号（默认1）
  createTime: number;
  id?: string;
  updateTime: string;
}

export default NNovel;

