// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import {i18n,loadLanguageAsync}  from './i18n'
import iView from 'iView';
import 'iview/dist/styles/iview.css';
import vueTouch from 'vue-touch';


Vue.use(vueTouch,{name:"v-touch"});
Vue.use(i18n);
Vue.use(iView, {
  i18n: function(path, options) {
    let value = i18n.t(path, options)
    if (value !== null && value !== undefined) {
      return value
    }
    return ''
  }
})
Vue.locale = () => {};

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App},
  template: '<App/>',
  i18n

})
