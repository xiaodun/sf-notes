import { Model } from "dva";
import NSevenStar from "../NSevenStar";
import SSevenStar from "../SSevenStar";
import NModel from "@/common/namespace/NModel";

export interface IState {
  rsp: {
    list: NSevenStar[];
  };
}

const MDSevenStarModel: Model = {
  namespace: "MDSevenStar",
  state: {
    rsp: {
      list: [],
    },
  },
  effects: {
    *getSevenStarList(
      _action: any,
      { call, put }: any
    ): Generator<any, void, any> {
      const rsp = yield call(SSevenStar.getSevenStarList);
      if (rsp.success) {
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
    *addSevenStar(action: any, { call, put }: any): Generator<any, void, any> {
      const rsp = yield call(SSevenStar.addSevenStar, action.payload);
      if (rsp.success) {
        yield put({
          type: "MDSevenStar/getSevenStarList",
        });
      }
    },
    *editSevenStar(action: any, { call, put }: any): Generator<any, void, any> {
      const rsp = yield call(SSevenStar.editSevenStar, action.payload);
      if (rsp.success) {
        yield put({
          type: "MDSevenStar/getSevenStarList",
        });
      }
    },
    *delSevenStar(action: any, { call, put }: any): Generator<any, void, any> {
      const rsp = yield call(SSevenStar.delSevenStar, action.payload);
      if (rsp.success) {
        yield put({
          type: "MDSevenStar/getSevenStarList",
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

export namespace MDSevenStar {
  class Action<P = any> extends NModel.IAction<P> {
    namespace = "MDSevenStar" as any;
  }

  export class ARSetState extends Action<Partial<IState>> {
    type = "ARSetState";
    constructor(public payload: Partial<IState>) {
      super(payload);
    }
  }

  export class ARGetSevenStarList extends Action<null> {
    type = "getSevenStarList";
    constructor() {
      super(null);
    }
  }

  export class ARAddSevenStar extends Action<
    Omit<NSevenStar, "id" | "createTime" | "updateTime">
  > {
    type = "addSevenStar";
    constructor(
      public payload: Omit<NSevenStar, "id" | "createTime" | "updateTime">
    ) {
      super(payload);
    }
  }

  export class AREditSevenStar extends Action<NSevenStar> {
    type = "editSevenStar";
    constructor(public payload: NSevenStar) {
      super(payload);
    }
  }

  export class ARDelSevenStar extends Action<string> {
    type = "delSevenStar";
    constructor(public payload: string) {
      super(payload);
    }
  }
}

export default MDSevenStarModel;


