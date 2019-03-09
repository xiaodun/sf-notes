import axios from "axios";
import builtService from "@root/service/app/config.json";
import { Message } from "iView";
import store from "@/vuex/store.js";
import Vue from "vue";
let isTip504 = false;
axios.defaults.baseURL = "/" + builtService.prefix;
axios.interceptors.response.use(
  function(response) {
    return response;
  },
  (error, response) => {
    if (error.response && error.response.status === 504) {
      //没有开启内置服务器
      if (isTip504 === false) {
        isTip504 = true;
        store.commit("change_app_state", false);
        Message.error("请开启内置的服务器");
      }
    } else {
      console.error(error);
    }
  }
);

class Helper {
  request(options) {
    return axios(options);
  }
}
var helper = new Helper();

Vue.prototype.$axios = helper;
export default helper;
