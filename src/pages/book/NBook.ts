export interface NBook {
  id: string;
  title: string;
  content: string;
  createTime: number;
}
export namespace NBook {
  export type TUpdaeType = "preface" | "chapter" | "book" | "epilog";
  export interface IUrlQuery {
    id?: string;
    prefaceId?: string;
    chapterId?: string;
    epilogId?: string;
  }
  export interface IBasicQueryParams {
    updateType: TUpdaeType;
    id: string;
  }
  export interface IContent extends IBasicQueryParams {
    title: string;
    content: string;
  }
}
export default NBook;
