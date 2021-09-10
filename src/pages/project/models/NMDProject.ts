import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NProject from "../NProject";

export namespace NMDProject {
  export interface IState {
    rsp: NRsp<NProject>;
    project: NProject;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDProject;
  }
  export class ARSetRsp extends Action<NRsp<NProject>> {
    type = "setRsp";
  }
  export class ARSetProject extends Action<NProject> {
    type = "setProject";
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
    },
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDProject.ARSetRsp) {
      state.rsp = payload;
    },
    setProject(state, { payload }: NMDProject.ARSetProject) {
      state.project = payload;
    },
  },
} as NModel<NMDProject.IState>;
