import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NFootball from "../NFootball";

export namespace NMDFootball {
  export interface IState {
    rsp: NRsp<NFootball>;
    config: NFootball.IConfig;
    football: NFootball;
    teamOddList: Array<NFootball.ITeamRecordOdds>;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDFootball;
  }
  export class ARSetState extends Action<Partial<NMDFootball.IState>> {
    type = "setState";
  }
}

export default {
  namespace: NModel.ENames.MDFootball,

  state: {
    rsp: {
      list: [],
    },
    config: {
      maxGameCount: 4,
    },
    football: {} as any,
    teamOddList: [],
  },
  effects: {},
  reducers: {
    setState(state, { payload }: NMDFootball.ARSetState) {
      for (let key in payload) {
        if (payload[key]) {
          state[key] = payload[key];
        }
      }
    },
  },
} as NModel<NMDFootball.IState>;
