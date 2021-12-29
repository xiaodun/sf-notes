import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NProject from "../NProject";

export namespace NMDProject {
  export interface IState {
    rsp: NRsp<NProject>;
    project: NProject;
    domainSwaggerList: NProject.IDomainSwagger[];
    commonMenuList: NProject.ICommandMenu[];
    apiPrefixs: NProject.IApiWithPrefix;
    menuCheckedList: NProject.IMenuCheckbox[];
    attentionPathList: NProject.IMenuCheckbox[];
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
    apiPrefixs: null,
    domainSwaggerList: [],
    rsp: {
      list: [],
    },
    project: {
      name: "",
      rootPath: "",
      isSfMock: false,
      sfMock: {
        programUrl: "",
        startPort: 0,
        startBatPath: "",
        nginxPort: null,
        addressPath: "",
        openUrl: "",
      },
      web: {
        isStart: null,
      },
    },
    commonMenuList: [],
    menuCheckedList: [],
    attentionPathList: [],
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