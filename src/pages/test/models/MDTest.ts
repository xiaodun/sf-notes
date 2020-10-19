import NModel from '@/common/type/NModel';

export namespace MDTest {
  export interface IState {
    name: string;
  }
  export class AEQuery extends NModel.IAction<{ name: string }> {
    type = 'query';
    namespace = NModel.ENames.MDTest;
  }
  export class ARSave extends NModel.IAction<{ name: string }> {
    type = 'save';
    namespace = NModel.ENames.MDTest;
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
