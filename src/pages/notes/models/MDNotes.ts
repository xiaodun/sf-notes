import NModel from "@/common/namespace/NModel";
import NRsp from "@/common/namespace/NRsp";
import NNotes from "../NNotes";

export namespace NMDNotes {
  export interface IState {
    noteSettingMap: Map<string, { isExpand: boolean }>;
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
    noteSettingMap: new Map(),
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
        if (!state.noteSettingMap.get(item.id)) {
          state.noteSettingMap.set(item.id, {
            isExpand: false,
          });
        }
      });
    },
    setTitleModel(state, { payload }: NMDNotes.ARSetTitleModel) {
      state.isTitleModel = payload;
    },
    changeNoteExpand(state, { payload }: NMDNotes.ArChangeNoteExpand) {
      state.noteSettingMap.set(payload.id, {
        isExpand: payload.isExpand,
      });
    },
    changeAllNoteExpand(state, { payload }: NMDNotes.ArChangeAllNoteExpand) {
      for (const settings of state.noteSettingMap.values()) {
        settings.isExpand = payload;
      }
    },
  },
} as NModel<NMDNotes.IState>;
