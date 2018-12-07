// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import App from './App';
import router from './router';
import iView from 'iView';
import 'iview/dist/styles/iview.css';
import store from './vuex/store.js';
Vue.use (iView);

/* eslint-disable no-new */
new Vue ({
  el: '#app',
  router,
  store,
  components: {App},
  template: '<App/>',
});
