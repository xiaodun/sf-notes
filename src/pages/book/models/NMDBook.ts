import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NBook from "../NBook";

export namespace NMDBook {
  export interface IState {
    rsp: NRsp<NBook>;
    book: NBook;
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
}

export default {
  namespace: NModel.ENames.MDBook,
  state: {
    rsp: {
      list: [],
    },
    book: { title: "", id: null, createTime: null, content: "" },
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDBook.ARSetRsp) {
      state.rsp = payload;
    },
  },
} as NModel<NMDBook.IState>;
