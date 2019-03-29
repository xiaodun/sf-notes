import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import File from "@/components/tools/notepad/file_manager.vue";
import Notepad from "@/components/tools/notepad/notepad.vue";
import Tag from "@/components/tools/notepad/tag_manager.vue";
describe("记事本-交互", () => {
  describe("与标签管理", () => {
    describe("点击标签管理", () => {
      let Container = { ...Notepad };
      let TagClone = { ...Tag };
      TagClone.mounted = null;
      Container.mounted = null;

      let wrapper = mount(Container, {
        attachToDocument: true,
        components: {
          TagManagerComponent: TagClone
        },
        stubs: ["FileManagerComponent", "KeyManagerComponent"]
      });
      let tagBtn = wrapper.find({
        ref: "tagBtn"
      });
      tagBtn.trigger("click");
      it("showModelFlag 为 tag", done => {
        expect(wrapper.vm.showModelFlag === "tag").toBe(true);
        done();
      });
      it("标签管理显示且日记本隐藏", done => {
        expect(wrapper.find(".card-wrapper").exists()).toBe(false);
        expect(wrapper.find(Tag).isVisible()).toBe(true);
        done();
      });
    });
  });
});
