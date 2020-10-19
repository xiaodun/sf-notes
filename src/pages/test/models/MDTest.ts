import { Model } from 'dva';
export interface MDTestState {
  name: string;
}
const defaultState: MDTestState = {
  name: '',
};
export default {
  state: defaultState,
  effects: {
    *query({ payload }, { call, put }) {},
  },
  reducers: {
    save(state, action) {
      state.name = action.payload;
    },
  },
  subscriptions: {
    setup({ dispatch, history }) {
      return history.listen(({ pathname }) => {
        if (pathname === '/') {
          dispatch({
            type: 'query',
          });
        }
      });
    },
  },
} as Partial<Model>;
