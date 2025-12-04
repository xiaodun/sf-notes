import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NJokes from "../NJokes";

export namespace NMDJokes {
  export interface IState {
    rsp: NRsp<NJokes>;
    currentIndex: number;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDJokes;
  }
  export class ARSetRsp extends Action<NRsp<NJokes>> {
    type = "setRsp";
  }
  export class ARSetCurrentIndex extends Action<number> {
    type = "setCurrentIndex";
  }
}

export default {
  namespace: NModel.ENames.MDJokes,
  state: {
    rsp: {
      list: [],
    },
    currentIndex: 0,
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDJokes.ARSetRsp) {
      state.rsp = payload;
      // 确保 currentIndex 不超出范围
      if (state.currentIndex >= payload.list.length) {
        state.currentIndex = Math.max(0, payload.list.length - 1);
      }
    },
    setCurrentIndex(state, { payload }: NMDJokes.ARSetCurrentIndex) {
      const maxIndex = state.rsp.list.length - 1;
      if (payload < 0) {
        state.currentIndex = 0;
      } else if (payload > maxIndex) {
        state.currentIndex = maxIndex;
      } else {
        state.currentIndex = payload;
      }
    },
  },
} as NModel<NMDJokes.IState>;



