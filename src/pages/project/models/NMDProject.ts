import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NProject from "../NProject";

export namespace NMDProject {
  export interface IState {
    rsp: NRsp<NProject>;
    config: NProject.IConfig;
    project: NProject;
    domainSwaggerList: NProject.IDomainSwagger[];
    apiPrefixs: NProject.IApiWithPrefix;
    menuCheckedList: NProject.IMenuCheckbox[];
    attentionInfos: NProject.IAttentionInfo;
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
    config: {
      addBasePath: "",
    },
    project: {
      name: "",
      rootPath: "",
      isSfMock: false,
      isDefaultAjaxCode: false,
      closeAjaxCode: false,
      isDefaultCopySwagger: false,
      sfMock: {
        serverList: [],
        programUrl: "",
        startPort: 0,
        startBatPath: "",
        addressPath: "",
        openUrl: "",
      },
      web: {
        isStart: null,
      },
      snippetList: [],
    },
    menuCheckedList: [],
    attentionInfos: {
      hasMoreGroup: false,
      list: [],
      groupInfos: {},
    },
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
