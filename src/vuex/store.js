import Vue from 'vue';
import Vuex from 'vuex';
Vue.use (Vuex);
let store = new Vuex.Store ({
  state: {
    isOnline: false,
  },
  mutations: {
    change_app_state (state, isOnline) {
      state.isOnline = isOnline;
    },
  },
});
export default store;
