import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Container from "@/components/tools/notepad/file_manager.vue";

describe("文件管理-初始", () => {
  describe("data数据初始验证", done => {
    let data = Container.data();

    it(`isShowUpdate为false`, done => {
      expect(data.isShowUpdate).toBe(false);
      done();
    });
    it(`uploadingList为[]`, done => {
      expect(data.uploadingList).toEqual([]);
      done();
    });
  });
  describe("model数据验证", done => {
    it("prop为uploadList、event为change", done => {
      expect(Container.model.prop).toBe("uploadList");
      expect(Container.model.event).toBe("change");
      done();
    });
  });
  describe("props数据验证", done => {
    it("uploadList类型为Array,默认值为[]", done => {
      expect(Container.props.uploadList.type).toBe(Array);
      expect(Container.props.uploadList.default()).toEqual([]);
      done();
    });
  });
  describe("mounted函数调用的方法", () => {
    describe("onGet", () => {
      let onGet = sinon.stub(Container.methods, "onGet");
      let wrapper = shallowMount(Container);
      it("只调用一次", done => {
        expect(onGet.callCount).toBe(1);
        done();
      });

      onGet.restore();
    });
    describe("查看调用的方法", done => {
      it("只调用了onGet", done => {
        expect(Container.mounted.toString().replace(/\s/g, "")).toEqual(
          `function mounted() {
          this.onGet();
        }`.replace(/\s/g, "")
        );
        done();
      });
    });
  });
});
