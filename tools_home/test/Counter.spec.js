// import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
// import Counter from "../src/components/test/Counter.vue";
// import moxios from "moxios";
// describe("Counter.vue-计数器", () => {
//   beforeEach(function() {
//     moxios.install();
//   });

//   afterEach(function() {
//     moxios.uninstall();
//   });
//   it("renders a div", done => {
//     moxios.stubRequest("/api/say/hello", {
//       status: 200,
//       responseText: "12"
//     });
//     moxios.stubRequest("/api/say/hello1", {
//       status: 200,
//       responseText: "12"
//     });
//     const wrapper = mount(Counter, {});
//     wrapper.find("#opp").trigger("click");
//     wrapper.find("#opp1").trigger("click");
//     setTimeout(() => {
//       expect(wrapper.find("#opp").text()).toBe("12");
//       expect(wrapper.find("#opp1").text()).toBe("12");
//     });
//      //这个done函数会影响后面测试文件的执行
//     done();
//   });
// });
