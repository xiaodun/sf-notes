import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NProject from "@/pages/project/NProject";
import NIterative from "../NIterative";

export namespace NMDIterative {
  export interface IState {
    rsp: NRsp<NIterative>;
    releaseConfig: NIterative.IReleaseConfig;
    gitConfig: NIterative.IGitConfig;
    personList: NIterative.IPerson[];
    productList: NIterative.IPerson[];
    roleList: NIterative.IRole[];
    systemList: NIterative.ISystem[];
    envList: NIterative.IEnv[];
    projectList: NProject[];
    iterative: NIterative;
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

    releaseConfig: {},
    productList: [],
    gitConfig: {
      newBranchDefaultPrefix: "",
    },
    iterative: {
      content: "",
      name: "",
      docPassword: "",
      docUrl: "",
      projectList: [],
      markTags: {
        envIdList: [],
      },
    },
    personList: [],
    roleList: [],
    systemList: [],
    projectList: [],
    envList: [],
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
