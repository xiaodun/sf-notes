export interface NBook {
  id: string;
  title: string;
  content: string;
  createTime: number;
  prefaceList: NBook.IPiece[];
  chapterList: NBook.IPiece[];
  epilogList: NBook.IPiece[];
}
export namespace NBook {
  export type TUpdaeType = "preface" | "chapter" | "book" | "epilog";
  export interface IBasicContent {
    title: string;
    content: string;
  }
  export interface IPiece extends IBasicContent {
    id?: string;
    createTime: number;
    updateTime: number;
  }
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

  export interface IPieceAddParams extends IBasicQueryParams {
    pos: number;
  }

  export interface IContent extends IBasicQueryParams, IBasicContent {}
  export interface ITitleDrawer {
    visible: boolean;
  }
}
export default NBook;
