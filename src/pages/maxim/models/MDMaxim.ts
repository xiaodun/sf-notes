import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NMaxim from "../NMaxim";

export namespace NMDMaxim {
  export interface IState {
    rsp: NRsp<NMaxim>;
    currentIndex: number;
    loading: boolean;
    hasMore: boolean; // 是否还有更多数据
    page: number; // 当前页码
    pageSize: number; // 每页数量
    mode: "list" | "random"; // 显示模式：列表模式或随机模式
  }

  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDMaxim;
  }

  export class ARSetRsp extends Action<NRsp<NMaxim>> {
    type = "setRsp";
  }

  export class ARSetCurrentIndex extends Action<number> {
    type = "setCurrentIndex";
  }

  export class ARSetLoading extends Action<boolean> {
    type = "setLoading";
  }

  export class ARSetHasMore extends Action<boolean> {
    type = "setHasMore";
  }

  export class ARSetPage extends Action<number> {
    type = "setPage";
  }

  export class ARSetPageSize extends Action<number> {
    type = "setPageSize";
  }

  export class ARSetMode extends Action<"list" | "random"> {
    type = "setMode";
  }

  export class ARAppendList extends Action<NMaxim[]> {
    type = "appendList";
  }
}

export default {
  namespace: NModel.ENames.MDMaxim,
  state: {
    rsp: {
      list: [],
    },
    currentIndex: 0,
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10,
    mode: "list", // 默认列表模式
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDMaxim.ARSetRsp) {
      state.rsp = payload;
      // 确保 currentIndex 不超出范围
      if (state.currentIndex >= payload.list.length) {
        state.currentIndex = Math.max(0, payload.list.length - 1);
      }
    },
    setCurrentIndex(state, { payload }: NMDMaxim.ARSetCurrentIndex) {
      const maxIndex = state.rsp.list.length - 1;
      if (payload < 0) {
        state.currentIndex = 0;
      } else if (payload > maxIndex) {
        state.currentIndex = maxIndex;
      } else {
        state.currentIndex = payload;
      }
    },
    setLoading(state, { payload }: NMDMaxim.ARSetLoading) {
      state.loading = payload;
    },
    setHasMore(state, { payload }: NMDMaxim.ARSetHasMore) {
      state.hasMore = payload;
    },
    setPage(state, { payload }: NMDMaxim.ARSetPage) {
      state.page = payload;
    },
    setPageSize(state, { payload }: NMDMaxim.ARSetPageSize) {
      state.pageSize = payload;
    },
    setMode(state, { payload }: NMDMaxim.ARSetMode) {
      state.mode = payload;
    },
    appendList(state, { payload }: NMDMaxim.ARAppendList) {
      state.rsp.list = [...state.rsp.list, ...payload];
    },
  },
} as NModel<NMDMaxim.IState>;

