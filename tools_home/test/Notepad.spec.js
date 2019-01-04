// import {shallowMount, mount, createLocalVue} from '@vue/test-utils';
// import Notepad from '../src/components/tools/notepad.vue';
// import iView from 'iView';
// import BuiltService from '@root/service/app/config.json';
// import axios from 'axios';
// import moxios from 'moxios';
// import sinon from 'sinon';
// // import 'iview/dist/styles/iview.css';
// const localVue = createLocalVue();
// var request = require('superagent');
// let xMLHttpRequest = window.XMLHttpRequest;
// window.XMLHttpRequest.prototype.open = function(method, url) {
//   console.log('http://192.168.8.155:8888' + url);
//   xMLHttpRequest(method, 'http://192.168.8.155:8888' + url);
// };

// localVue.use(iView);
// describe('记事本', () => {
//   beforeEach(function() {
//     moxios.install();
//   });
//   afterEach(function() {
//     moxios.uninstall();
//   });
//   //   it('测试后台请求', () => {
//   //     request
//   //       .get('http://192.168.8.155:8888/api/notepad/tag/get')
//   //       .end(function(err, res) {
//   //         console.log(res);
//   //         expect(res).to.be.an('object');
//   //         done();
//   //       });
//   //   });

//   it('记事本', () => {
//     moxios.stubRequest('/api/notepad/tag/get', {
//       status: 200,
//       responseText: 'hello',
//     });

//     let wraper = mount(Notepad, {
//       localVue,
//       attachToDocument: true,
//     });
//   });
// });
