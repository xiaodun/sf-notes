import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NBook from "../NBook";

export namespace NMDBook {
  export interface IState {
    rsp: NRsp<NBook>;
    book: NBook;
    titleDrawer: NBook.ITitleDrawer;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDBook;
  }
  export class ARSetRsp extends Action<NRsp<NBook>> {
    type = "setRsp";
  }
  export class ARSetBook extends Action<NBook> {
    type = "setBook";
  }
  export class ARSetTitleDrawer extends Action<Partial<NBook.ITitleDrawer>> {
    type = "setTitleDrawer";
  }
}

export default {
  namespace: NModel.ENames.MDBook,
  state: {
    rsp: {
      list: [],
    },
    book: {
      title: "",
      id: null,
      createTime: null,
      content: "",
      prefaceList: [],
      chapterList: [],
      epilogList: [],
    },
    titleDrawer: {
      visible: true,
    },
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDBook.ARSetRsp) {
      state.rsp = payload;
    },
    setBook(state, { payload }: NMDBook.ARSetBook) {
      state.book = payload;
    },

    setTitleDrawer(state, { payload }: NMDBook.ARSetTitleDrawer) {
      Object.keys(payload).forEach((key) => {
        state.titleDrawer[key] = payload[key];
      });
    },
  },
} as NModel<NMDBook.IState>;
