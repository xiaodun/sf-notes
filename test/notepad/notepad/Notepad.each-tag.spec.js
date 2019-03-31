import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import File from "@/components/tools/notepad/file_manager.vue";
import Notepad from "@/components/tools/notepad/notepad.vue";
import Tag from "@/components/tools/notepad/tag_manager.vue";
import Key from "@/components/tools/notepad/key_manager.vue";
describe("记事本-交互", () => {
  let Container = { ...Notepad };
  let TagClone = { ...Tag };
  let KeyClone = { ...Key };
  let FileClone = { ...File };
  TagClone.mounted = null;
  KeyClone.mounted = null;
  FileClone.mounted = null;
  Container.mounted = null;

  let wrapper = mount(Container, {
    attachToDocument: true,
    components: {
      TagManagerComponent: TagClone,
      KeyManagerComponent: KeyClone,
      FileManagerComponent: FileClone
    },
  });
  describe("与标签管理", () => {
    describe("点击标签管理按钮", () => {

      let tagBtn = wrapper.find('.tag-btn');
      tagBtn.trigger("click");
      it("showModelFlag 为 tag", done => {
        expect(wrapper.vm.showModelFlag === "tag").toBe(true);
        done();
      });
      it("标签管理显示且日记本、密钥管理、文件管理隐藏", done => {
        expect(wrapper.find(".card-wrapper").exists()).toBe(false);
        expect(wrapper.find(File).isVisible()).toBe(false);

        //密钥管理的隐藏是自定义标签:show控制的
        expect(wrapper.find("#key_manager-vue-id").isVisible()).toBe(false);
        expect(wrapper.find(Tag).isVisible()).toBe(true);
        done();
      });
      it("点击返回按钮", done => {
        wrapper.find(Tag).find('.first-btn').trigger('click');
        it("showModelFlag 为 notepad", done => {
          expect(wrapper.vm.showModelFlag === "notepad").toBe(true);
          done();
        });
        it("标签管理、密钥管理、文件管理隐藏,日记本显示", done => {
          expect(wrapper.find(".card-wrapper").exists()).toBe(true);
          expect(wrapper.find(File).isVisible()).toBe(false);

          //密钥管理的隐藏是自定义标签:show控制的
          expect(wrapper.find("#key_manager-vue-id").isVisible()).toBe(false);
          expect(wrapper.find(Tag).isVisible()).toBe(false);
          done();
        });
        done();
      });
    });
  });

});
