import NModel from '@/common/type/NModel';

export namespace MDTest {
  export interface IState {
    name: string;
  }
  class Action<P> extends NModel.IAction<P> {
    namespace = NModel.ENames.MDTest;
  }
  export class AEQuery extends Action<{ name: string }> {
    type = 'query';
  }
  export class ARSave extends Action<{ name: string }> {
    type = 'save';
  }
}

export default {
  namespace: NModel.ENames.MDTest,
  state: {
    name,
  },
  effects: {
    *query({ payload }: MDTest.AEQuery) {
      NModel.dispatch(new MDTest.ARSave({ name: 'oop' }));
    },
  },
  reducers: {
    save(state, { payload }: MDTest.ARSave) {
      state.name = payload.name;
    },
  },
} as NModel<MDTest.IState>;
