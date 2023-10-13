import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NNotes from "../NNotes";

interface INoteSettingObj{
  [key:string]:{isExpand:boolean}
}
export namespace NMDNotes {
  export interface IState {
    noteSettingObjs: INoteSettingObj;
    rsp: NRsp<NNotes>;
    isTitleModel: boolean;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDNotes;
  }
  export class ARSetRsp extends Action<NRsp<NNotes>> {
    type = "setRsp";
  }
  export class ARSetTitleModel extends Action<boolean> {
    type = "setTitleModel";
  }
  export class ArChangeNoteExpand extends Action<{
    id: string;
    isExpand: boolean;
  }> {
    type = "changeNoteExpand";
  }
  export class ArChangeAllNoteExpand extends Action<boolean> {
    type = "changeAllNoteExpand";
  }
}

export default {
  namespace: NModel.ENames.MDNotes,
  state: {
    noteSettingObjs: {},
    rsp: {
      list: [],
    },
    isTitleModel: false,
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDNotes.ARSetRsp) {
      state.rsp = payload;
      payload.list.forEach((item) => {
        if (!state.noteSettingObjs[item.id]) {
          state.noteSettingObjs[item.id] = {
            isExpand: false,
          };
        }
      });
    },
    setTitleModel(state, { payload }: NMDNotes.ARSetTitleModel) {
      state.isTitleModel = payload;
    },
    changeNoteExpand(state, { payload }: NMDNotes.ArChangeNoteExpand) {
      state.noteSettingObjs[payload.id] = {
        isExpand: payload.isExpand,
      };
    },
    changeAllNoteExpand(state, { payload }: NMDNotes.ArChangeAllNoteExpand) {
      for (const settings of Object.values(state.noteSettingObjs)) {
        settings.isExpand = payload;
      }
    },
  },
} as NModel<NMDNotes.IState>;
