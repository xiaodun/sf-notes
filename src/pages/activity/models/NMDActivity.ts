import NModel from "@/common/namespace/NModel";
import NActivity from "../NActivity";

export namespace NMDActivity {
  export interface IState {
    list: NActivity[];
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDActivity;
  }
  export class ARSetState extends Action<Partial<NMDActivity.IState>> {
    type = "setState";
  }
}

export default {
  namespace: NModel.ENames.MDActivity,
  state: {
    list: null,
  },
  effects: {},
  reducers: {
    setState(state, { payload }: NMDActivity.ARSetState) {
      for (let key in payload) {
        if (payload[key]) {
          state[key] = payload[key];
        }
      }
    },
  },
} as NModel<NMDActivity.IState>;
