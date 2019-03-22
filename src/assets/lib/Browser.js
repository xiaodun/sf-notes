import Vue from "vue";
let browserMessage = {

}
let userAgent = window.navigator.userAgent;

if (!!/MicroMessenger/i.test(userAgent)) {
    browserMessage.isWeChat = true;
}

Vue.prototype.$browserMessage = browserMessage;