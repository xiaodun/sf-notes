import { Model } from "dva";
import NLottery from "../NLottery";
import SLottery from "../SLottery";
import NModel from "@/common/namespace/NModel";

export interface IState {
  rsp: {
    list: NLottery[];
  };
}

const MDLotteryModel: Model = {
  namespace: "MDLottery",
  state: {
    rsp: {
      list: [],
    },
  },
  effects: {
    *getLotteryList(
      _action: any,
      { call, put }: any
    ): Generator<any, void, any> {
      const rsp = yield call(SLottery.getLotteryList);
      if (rsp.success) {
        // 后端返回的数据结构是 { success: true, data: [...] }
        // request.ts 处理后，rsp.data 就是数组
        const list = Array.isArray(rsp.data) ? rsp.data : rsp.data?.data || [];
        yield put({
          type: "ARSetState",
          payload: {
            rsp: {
              list,
            },
          },
        });
      }
    },
    *addLottery(action: any, { call, put }: any): Generator<any, void, any> {
      const rsp = yield call(SLottery.addLottery, action.payload);
      if (rsp.success) {
        yield put({
          type: "MDLottery/getLotteryList",
        });
      }
    },
    *editLottery(action: any, { call, put }: any): Generator<any, void, any> {
      const rsp = yield call(SLottery.editLottery, action.payload);
      if (rsp.success) {
        yield put({
          type: "MDLottery/getLotteryList",
        });
      }
    },
    *delLottery(action: any, { call, put }: any): Generator<any, void, any> {
      const rsp = yield call(SLottery.delLottery, action.payload);
      if (rsp.success) {
        yield put({
          type: "MDLottery/getLotteryList",
        });
      }
    },
  },
  reducers: {
    ARSetState(state: IState, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};

export namespace MDLottery {
  class Action<P = any> extends NModel.IAction<P> {
    namespace = "MDLottery" as any;
  }

  export class ARSetState extends Action<Partial<IState>> {
    type = "ARSetState";
    constructor(public payload: Partial<IState>) {
      super(payload);
    }
  }

  export class ARGetLotteryList extends Action<null> {
    type = "getLotteryList";
    constructor() {
      super(null);
    }
  }

  export class ARAddLottery extends Action<
    Omit<NLottery, "id" | "createTime" | "updateTime">
  > {
    type = "addLottery";
    constructor(
      public payload: Omit<NLottery, "id" | "createTime" | "updateTime">
    ) {
      super(payload);
    }
  }

  export class AREditLottery extends Action<NLottery> {
    type = "editLottery";
    constructor(public payload: NLottery) {
      super(payload);
    }
  }

  export class ARDelLottery extends Action<string> {
    type = "delLottery";
    constructor(public payload: string) {
      super(payload);
    }
  }
}

export default MDLotteryModel;

