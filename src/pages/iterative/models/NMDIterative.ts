import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NIterative from "../NIterative";

export namespace NMDIterative {
  export interface IState {
    rsp: NRsp<NIterative>;
    config: NIterative.IConfig;
    roleList: NIterative.IRole[];
    roleTagList: NIterative.IRoleTag[];
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDIterative;
  }
  export class ARSetState extends Action<Partial<NMDIterative.IState>> {
    type = "setState";
  }
}

export default {
  namespace: NModel.ENames.MDIterative,

  state: {
    rsp: {
      list: [],
    },
    config: {},
    roleList: [],
    roleTagList: [],
  },
  effects: {},
  reducers: {
    setState(state, { payload }: NMDIterative.ARSetState) {
      for (let key in payload) {
        if (payload[key]) {
          state[key] = payload[key];
        }
      }
    },
  },
} as NModel<NMDIterative.IState>;
