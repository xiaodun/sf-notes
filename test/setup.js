require("jsdom-global")();
global.expect = require("expect");
global.iView = require("iView");
global.Vue = require("vue");
global.moxios = require("moxios");
global.sinon = require("sinon");
global.CryptoJS = require("crypto-js");
global.Vue.use(global.iView);
//这里无法使用require和import 加载自己些的js模块
global.Vue.prototype.$browserMessage = {};
