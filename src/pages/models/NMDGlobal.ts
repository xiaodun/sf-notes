import NModel from "@/common/namespace/NModel";

export namespace NMDGlobal {
  export interface IState {
    showHeader: boolean;
    controlLayout: boolean;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDGlobal;
  }
  export class ARChangeSetting extends Action<Partial<NMDGlobal.IState>> {
    type = "changSettings";
  }
}

export default {
  namespace: NModel.ENames.MDGlobal,
  state: {
    showHeader: true,
    controlLayout: true,
  },
  effects: {},
  reducers: {
    changSettings(state, { payload }: NMDGlobal.ARChangeSetting) {
      Object.keys(payload).forEach((key) => {
        state[key] = payload[key];
      });
    },
  },
} as NModel<NMDGlobal.IState>;
