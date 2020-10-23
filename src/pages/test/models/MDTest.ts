import NModel from '@/common/type/NModel';

export namespace NMDTest {
  export interface IState {
    name: string;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDTest;
  }
  export class AEQuery extends Action<{ name: string }> {
    type = 'query';
  }
  export class ARSave extends Action<{ name: string; age: number }> {
    type = 'save';
  }
}

export default {
  namespace: NModel.ENames.MDTest,
  state: {
    name,
  },
  effects: {
    *query({ payload }: NMDTest.AEQuery, { put }) {
      NModel.dispatch(new NMDTest.ARSave({ name: 'oop', age: 12 }));
    },
  },
  reducers: {
    save(state, { payload }: NMDTest.ARSave) {
      state.name = payload.name;
    },
  },
} as NModel<NMDTest.IState>;
