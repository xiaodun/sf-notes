import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import DateHelper from "@/assets/lib/DateHelper";
import File from "@/components/tools/notepad/file_manager.vue";
import Notepad from "@/components/tools/notepad/notepad.vue";
describe("记事本-函数功能测试", () => {
  let Container = { ...Notepad };
  Container.mounted = null;

  let wrapper = mount(Container, {
    attachToDocument: true,
    stubs: [
      "TagManagerComponent",
      "KeyManagerComponent",
      "FileManagerComponent"
    ]
  });
  it("convertHtml-将内容中链接转换为a标签", done => {
    let argContent =
      "深入了解git\nhttps://git-scm.com/book/zh/v1/%E8%B5%B7%E6%AD%A5";
    let result = `深入了解git\n<a target="_black" href="https://git-scm.com/book/zh/v1/%E8%B5%B7%E6%AD%A5">https://git-scm.com/book/zh/v1/%E8%B5%B7%E6%AD%A5</a>`;
    console.log(argContent);
    console.log(result);
    expect(wrapper.vm.convertHtml(argContent)).toEqual(result);
    done();
  });

  it("convert 对后台返回的数据做一些基本处理", done => {
    let timestamp = +new Date() - 86400000;
    let dateHrlper = DateHelper.get_instance_timestamp(timestamp);

    let dateStr = dateHrlper.get_format_date();
    let argNotepad = {
      content: "12",
      createTime: timestamp,
      id: 1554037095663,
      updateTime: timestamp
    };
    let result = {
      content: "12",
      createTime: dateStr,
      id: 1554037095663,
      updateTime: dateStr,
      title: dateStr,
      isMouseOver: false,
      shadowBlur: 16,
      shadowAlpha: 0.25,
      shadowSpread: 5
    };
    console.log(argNotepad);
    console.log(result);
    expect(wrapper.vm.convert(argNotepad)).toEqual(result);
    done();
  });
  it("encrypt 加密 和 decrypt 解密", done => {
    let argKey = CryptoJS.enc.Utf8.parse("abacdefageacadfa");
    let argContent = "昔日龌龊不足夸，今朝放荡思无涯。";
    let result =
      "lXH5VkIlXI/Os8Mx/Tp4LYx1jfA5hq9mhZjGTFTnSBi/GUbu9M4UBqqj9x9v68ai0vV4ieR+S8sqE8DFiuSvZA==";
    expect(wrapper.vm.encrypt(argKey, argContent)).toEqual(result);
    expect(wrapper.vm.decrypt(argKey, result)).toEqual(argContent);
    done();
  });
});
