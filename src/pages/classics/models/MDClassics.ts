import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NClassics from "../NClassics";
import NAuthor from "../NAuthor";
import NDynasty from "../NDynasty";

import Browser from "@/utils/browser";

// 统一管理 pageSize
export const getPageSize = () => {
  return Browser.isMobile() ? 5 : 10;
};

export namespace NMDClassics {
  export interface IState {
    rsp: NRsp<NClassics>;
    currentIndex: number;
    loading: boolean;
    hasMore: boolean; // 是否还有更多数据
    page: number; // 当前页码
    pageSize: number; // 每页数量
    authors: NAuthor[]; // 作者列表
    dynasties: NDynasty[]; // 朝代列表
    authorsLoading: boolean; // 作者列表加载中
    dynastiesLoading: boolean; // 朝代列表加载中
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDClassics;
  }
  export class ARSetRsp extends Action<NRsp<NClassics>> {
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
  export class ARAppendList extends Action<NClassics[]> {
    type = "appendList";
  }
  export class ARUpdateItem extends Action<NClassics> {
    type = "updateItem";
  }
  export class ARSetAuthors extends Action<NAuthor[]> {
    type = "setAuthors";
  }
  export class ARSetDynasties extends Action<NDynasty[]> {
    type = "setDynasties";
  }
  export class ARSetAuthorsLoading extends Action<boolean> {
    type = "setAuthorsLoading";
  }
  export class ARSetDynastiesLoading extends Action<boolean> {
    type = "setDynastiesLoading";
  }
}

export default {
  namespace: NModel.ENames.MDClassics,
  state: {
    rsp: {
      list: [],
    },
    currentIndex: 0,
    loading: false,
    hasMore: true,
    page: 1,
    pageSize: 10, // 默认值，会在组件初始化时更新
    authors: [],
    dynasties: [],
    authorsLoading: false,
    dynastiesLoading: false,
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDClassics.ARSetRsp) {
      state.rsp = payload;
      // 确保 currentIndex 不超出范围
      if (state.currentIndex >= payload.list.length) {
        state.currentIndex = Math.max(0, payload.list.length - 1);
      }
    },
    setCurrentIndex(state, { payload }: NMDClassics.ARSetCurrentIndex) {
      const maxIndex = state.rsp.list.length - 1;
      if (payload < 0) {
        state.currentIndex = 0;
      } else if (payload > maxIndex) {
        state.currentIndex = maxIndex;
      } else {
        state.currentIndex = payload;
      }
    },
    setLoading(state, { payload }: NMDClassics.ARSetLoading) {
      state.loading = payload;
    },
    setHasMore(state, { payload }: NMDClassics.ARSetHasMore) {
      state.hasMore = payload;
    },
    setPage(state, { payload }: NMDClassics.ARSetPage) {
      state.page = payload;
    },
    setPageSize(state, { payload }: NMDClassics.ARSetPageSize) {
      state.pageSize = payload;
    },
    appendList(state, { payload }: NMDClassics.ARAppendList) {
      state.rsp.list = [...state.rsp.list, ...payload];
    },
    updateItem(state, { payload }: NMDClassics.ARUpdateItem) {
      const index = state.rsp.list.findIndex((item) => item.id === payload.id);
      if (index !== -1) {
        state.rsp.list[index] = { ...state.rsp.list[index], ...payload };
      }
    },
    setAuthors(state, { payload }: NMDClassics.ARSetAuthors) {
      state.authors = payload;
    },
    setDynasties(state, { payload }: NMDClassics.ARSetDynasties) {
      state.dynasties = payload;
    },
    setAuthorsLoading(state, { payload }: NMDClassics.ARSetAuthorsLoading) {
      state.authorsLoading = payload;
    },
    setDynastiesLoading(state, { payload }: NMDClassics.ARSetDynastiesLoading) {
      state.dynastiesLoading = payload;
    },
  },
} as NModel<NMDClassics.IState>;


