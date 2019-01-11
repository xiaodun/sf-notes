// import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
// import Notepad from "../src/components/tools/notepad.vue";
// import iView from "iView";
// import BuiltService from "@root/service/app/config.json";
// import moxios from "moxios";
// import AxiosHelper from "@/assets/lib/AxiosHelper";
// const localVue = createLocalVue();

// localVue.use(iView);
// describe("记事本", () => {
//   beforeEach(function() {
//     moxios.install();
//   });
//   afterEach(function() {
//     moxios.uninstall();
//   });
//   moxios.stubRequest("/api/notepad/tag/get", {
//     status: 200,
//     response: [
//       {
//         id: 1542775224227,
//         content: "书籍"
//       },
//       {
//         id: 1542621742967,
//         content: "实践"
//       }
//     ]
//   });
//   moxios.stubRequest("/api/notepad/notepad/get", {
//     status: 200,
//     response: {
//       data: [
//         {
//           title: "",
//           content: "手脑通组件  点击列表自动播放",
//           tagIdList: [],
//           createTime: 1546999563691,
//           id: 1546999563691,
//           updateTime: ""
//         },
//         {
//           title: "",
//           content: "七巧板应用",
//           tagIdList: [],
//           createTime: 1546997938804,
//           id: 1546997938804,
//           updateTime: ""
//         }
//       ],
//       total: 2
//     }
//   });
//   it("编辑记事本时弹窗自动获得焦点", done => {
//     let wraper = mount(Notepad, {
//       localVue,
//       attachToDocument: true
//     });

//     done();
//   });
// });
