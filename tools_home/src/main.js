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

Vue.component ('my-checkbox', {
  template: `<input :checked="checked" @change="change" type="checkbox"/>`,
  model: {
    prop: 'checked',
    event: 'change',
  },
  methods: {
    change (event) {
      console.log (event.target.checked);
      this.$emit ('change', event.target.checked);
    },
  },
  props: {
    checked: {
      type: Boolean,
      default: true,
    },
  },
});

new Vue ({
  router,
  store,
  render: h => h (App),
}).$mount ('#app');
