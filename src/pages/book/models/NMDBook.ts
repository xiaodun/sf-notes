import NModel from '@/common/namespace/NModel';
import NRsp from '@/common/namespace/NRsp';
import NBook from '../NBook';

export namespace NMDBook {
  export interface IState {
    rsp: NRsp<NBook>;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDBook;
  }
  export class ARSetRsp extends Action<NRsp<NBook>> {
    type = 'setRsp';
  }
}

export default {
  namespace: NModel.ENames.MDBook,
  state: {
    rsp: {
      list: [],
    },
  },
  effects: {},
  reducers: {
    setRsp(state, { payload }: NMDBook.ARSetRsp) {
      state.rsp = payload;
    },
  },
} as NModel<NMDBook.IState>;
