// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import App from "./App";
import router from "./router";
import iView from "iView";
import "iview/dist/styles/iview.css";
import "@/assets/lib/AxiosHelper";
import "@/assets/lib/Browser/index";
Vue.use(iView);
new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
