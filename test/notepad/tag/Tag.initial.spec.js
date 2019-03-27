import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import TagManager from "@/components/tools/notepad/tag_manager.vue";

describe("标签管理-初始", () => {
  describe("data数据初始验证", done => {
    let data = TagManager.data();

    it(`tagName为''`, done => {
      expect(data.tagName).toBe("");
      done();
    });
  });
  describe("model数据验证", done => {
    it("prop为list、event为change", done => {
      expect(TagManager.model.prop).toBe("list");
      expect(TagManager.model.event).toBe("change");
      done();
    });
  });
  describe("props数据验证", done => {
    it("list类型为Array,默认值为[]", done => {
      expect(TagManager.props.list.type).toBe(Array);
      expect(TagManager.props.list.default()).toEqual([]);
      done();
    });
  });
  describe("mounted函数调用的方法", () => {
    describe("onGet", () => {
      let onGet = sinon.stub(TagManager.methods, "onGet");
      let wrapper = shallowMount(TagManager);
      it("只调用一次", done => {
        expect(onGet.callCount).toBe(1);
        done();
      });

      onGet.restore();
    });
    describe("查看调用的方法", done => {
      it("只调用了onGet", done => {
        expect(TagManager.mounted.toString().replace(/\s/g, "")).toEqual(
          `function mounted() {
          this.onGet();
        }`.replace(/\s/g, "")
        );
        done();
      });
    });
  });
});
