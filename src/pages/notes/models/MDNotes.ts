import NModel from '@/common/namespace/NModel';
import NRsp from '@/common/namespace/NRsp';
import NNotes from '../NNotes';

export namespace NMDNotes {
  export interface IState {
    rsp: NRsp<NNotes>;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDNotes;
  }
  export class ARSetRsp extends Action<NRsp<NNotes>> {
    type = 'setRsp';
  }
}

export default {
  namespace: NModel.ENames.MDNotes,
  state: {
    rsp: {
      list: [],
    },
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDNotes.ARSetRsp) {
      state.rsp = payload;
    },
  },
} as NModel<NMDNotes.IState>;
