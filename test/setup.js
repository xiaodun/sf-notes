require("jsdom-global")();
global.expect = require("expect");
global.iView = require("iView");
global.Vue = require("vue");
global.moxios = require("moxios");
global.sinon = require("sinon");
global.CryptoJS = require("crypto-js");
global.Vue.use(global.iView);
global.Vue.prototype.$browserMessage = import("@/assets/lib/Browser/Browser");
