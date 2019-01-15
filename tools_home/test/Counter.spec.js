import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Counter from "../src/components/test/Counter.vue";
import moxios from "moxios";
import Vue from "vue";
import sinon from "sinon";
import AxiosHelper from "@/assets/lib/AxiosHelper";
let localVue = createLocalVue();

describe("键盘事件测试", done => {
  beforeEach(function() {
    moxios.install();
  });
  afterEach(function() {
    moxios.uninstall();
  });
  it("测试axios", done => {
    moxios.stubRequest("/api/say/hello", {
      status: 200,
      responseText: "wx"
    });
    const wrapper = mount(Counter, {
      localVue
    });
    wrapper.find("#button-id").trigger("click");

    setTimeout(() => {
      expect(wrapper.vm.quantity).toEqual("wx");
    });
    console.log(wrapper.find("#test-id").text());
    done();
  });
});
