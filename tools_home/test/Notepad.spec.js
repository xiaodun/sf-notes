import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Notepad from "../src/components/tools/notepad.vue";
import iView from "iView";
import Vue from "vue";
import BuiltService from "@root/service/app/config.json";
import moxios from "moxios";
import AxiosHelper from "@/assets/lib/AxiosHelper";
import sinon from "sinon";
const localVue = createLocalVue();

localVue.use(iView);
describe("记事本", () => {
  beforeEach(function() {
    moxios.install();
  });
  afterEach(function() {
    moxios.uninstall();
  });
  const tagResponseData = [
    {
      id: 1542775224227,
      content: "书籍"
    },
    {
      id: 1542621742967,
      content: "实践"
    }
  ];
  const notepadResponseData = {
    data: [
      {
        title: "",
        content: "手脑通组件  点击列表自动播放",
        tagIdList: [],
        createTime: 1546999563691,
        id: 1546999563691,
        updateTime: ""
      },
      {
        title: "",
        content: "七巧板应用",
        tagIdList: [],
        createTime: 1546997938804,
        id: 1546997938804,
        updateTime: ""
      }
    ],
    total: 2
  };
  moxios.stubRequest("/api/notepad/tag/get", {
    status: 200,
    response: tagResponseData
  });
  moxios.stubRequest("/api/notepad/notepad/get", {
    status: 200,
    response: notepadResponseData
  });

  it("生命周期中调用request_get_tag", done => {
    let wrapper = mount(Notepad, {
      localVue,
      attachToDocument: true
    });
    setTimeout(() => {
      expect(JSON.stringify(wrapper.vm.tagModel.list)).toEqual(
        JSON.stringify(tagResponseData)
      );
    });
    done();
  });
  it("生命周期中调用request_get", done => {
    let wrapper = mount(Notepad, {
      localVue,
      attachToDocument: true
    });
    setTimeout(() => {
      let isHaveNotSame = wrapper.vm.list.some((el, index, arr) => {
        if (el.content !== notepadResponseData.data[index].content) {
          return true;
        }
      });
      expect(isHaveNotSame).toBe(false);
    });
    done();
  });

  it("编辑记事本时弹窗自动获得焦点", done => {
    let wrapper = mount(Notepad, {
      localVue,
      attachToDocument: true
    });
    wrapper.vm.edit(
      {
        title: "",
        content: "七巧板应用",
        tagIdList: [],
        createTime: 1546997938804,
        id: 1546997938804,
        updateTime: ""
      },
      0
    );
    let textarea = wrapper.find({
      ref: "autoFocusInput"
    });

    setTimeout(() => {
      //不知为何获取不到
      // textarea.find(".ivu-input").text()
      expect(textarea.find(".ivu-input").html()).toEqual(
        document.activeElement.outerHTML
      );
    });
    done();
  });
  it("初始数据验证", done => {
    let wrapper = mount(Notepad, {
      localVue,
      attachToDocument: true
    });

    expect(wrapper.vm.list.length).toBe(0);
    expect(wrapper.vm.tagModel.list.length).toBe(0);
    done();
  });
});
