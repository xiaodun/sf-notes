import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NProject from "../NProject";

export namespace NMDProject {
  export interface IState {
    rsp: NRsp<NProject>;
    project: NProject;
    commonMenuList: NProject.ICommandMenu[];
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDProject;
  }
  export class ARSetState extends Action<Partial<NMDProject.IState>> {
    type = "setState";
  }
}

export default {
  namespace: NModel.ENames.MDProject,
  state: {
    rsp: {
      list: [],
    },
    project: {
      name: "",
      rootPath: "",
      isSfMock: false,
      sfMock: {
        startBatPath: "",
      },
      web: {
        isStart: null,
      },
    },
    commonMenuList: [],
  },
  effects: {},
  reducers: {
    setState(state, { payload }: NMDProject.ARSetState) {
      for (let key in payload) {
        if (payload[key]) {
          state[key] = payload[key];
        }
      }
    },
  },
} as NModel<NMDProject.IState>;
