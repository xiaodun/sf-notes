import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import Notepad from "@/components/tools/notepad/notepad.vue";
let container = { ...Notepad };
describe("记事本-初始", () => {
  describe("data数据初始验证", done => {
    let data = container.data();

    it("list为null", done => {
      expect(data.list).toBe(null);
      done();
    });
    it("publicKey为null", done => {
      expect(data.publicKey).toBe(null);
      done();
    });
    it(`filterTagId为""`, done => {
      expect(data.filterTagId).toBe("");
      done();
    });
    it("showModelFlag为notepad", done => {
      expect(data.showModelFlag).toBe("notepad");
      done();
    });
    it(`pagination为${JSON.stringify(data.pagination)}`, done => {
      expect(data.pagination).toEqual({
        page: 1,
        size: 3
      });
      done();
    });
    it("fileUploadList为[]", done => {
      expect(data.fileUploadList).toEqual([]);
      done();
    });
    it("tagList为[]", done => {
      expect(data.tagList).toEqual([]);
      done();
    });
  });
  describe("mounted函数调用的方法", () => {
    describe("onGet", () => {
      let onGet = sinon.stub(container.methods, "onGet");
      let wrapper = shallowMount(container);
      it("只调用一次", done => {
        expect(onGet.callCount).toBe(1);
        done();
      });
      it(`伴随参数为${JSON.stringify(wrapper.vm.pagination)}`, done => {
        done();
      });
      onGet.restore();
    });
    describe("查看调用的方法", done => {
      it("只调用了onGet", done => {
        expect(container.mounted.toString().replace(/\s/g, "")).toEqual(
          `function mounted() {
          this.onGet(this.pagination);
        }`.replace(/\s/g, "")
        );
        done();
      });
    });
  });
});
