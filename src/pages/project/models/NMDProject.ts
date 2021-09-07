import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NProject from "../NProject";

export namespace NMDProject {
  export interface IState {}
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDProject;
  }
}

export default {
  namespace: NModel.ENames.MDProject,
  state: {},
  effects: {},
  reducers: {},
} as NModel<NMDProject.IState>;
