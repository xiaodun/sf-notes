import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NProject from "@/pages/project/NProject";
import NIterative from "../NIterative";

export namespace NMDIterative {
  export interface IState {
    rsp: NRsp<NIterative>;
    config: NIterative.IConfig;
    gitConfig: NIterative.IGitConfig;
    roleList: NIterative.IRole[];
    roleTagList: NIterative.ITag[];
    systemTagList: NIterative.ITag[];
    envTagList: NIterative.ITag[];
    projectList: NProject[];
    iteratives: NIterative;
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
    gitConfig: {
      newBranchDefaultPrefix: "",
    },
    iteratives: {
      name: "",
      docPassword: "",
      docUrl: "",
      projectList: [],
    },
    roleList: [],
    roleTagList: [],
    systemTagList: [],
    projectList: [],
    envTagList: [],
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
