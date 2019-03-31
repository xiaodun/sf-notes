import { shallowMount, mount, createLocalVue } from "@vue/test-utils";
import File from "@/components/tools/notepad/file_manager.vue";
import Notepad from "@/components/tools/notepad/notepad.vue";
describe("记事本-函数功能测试", () => {
    let Container = { ...Notepad };
    Container.mounted = null;

    let wrapper = mount(Container, {
        attachToDocument: true,
        stubs: ["TagManagerComponent",
            "KeyManagerComponent",
            "FileManagerComponent"]
    });
    it("convertHtml-将内容中链接转换为a标签", (done) => {
        let argContent = "深入了解git\nhttps://git-scm.com/book/zh/v1/%E8%B5%B7%E6%AD%A5";
        let result = `深入了解git\n<a target="_black" href="https://git-scm.com/book/zh/v1/%E8%B5%B7%E6%AD%A5">https://git-scm.com/book/zh/v1/%E8%B5%B7%E6%AD%A5</a>`;
        console.log(argContent);
        console.log(result);
        expect(wrapper.vm.convertHtml(argContent)).toEqual(result)
        done();
    })

    it("convert 对后台返回的数据做一些基本处理", (done) => {

        let argNotepad = {
            content: "12",
            createTime: 1553731200000,
            id: 1554037095663,
            updateTime: 1553731200000,
        }
        let result = {
            content: '12',
            createTime: '2019-03-28',
            id: 1554037095663,
            updateTime: '2019-03-28',
            title: '2019-03-28',
            isMouseOver: false,
            shadowBlur: 36,
            shadowAlpha: 0.35000000000000003,
            shadowSpread: 15
        };
        console.log(argNotepad);
        console.log(result);
        expect(wrapper.vm.convert(argNotepad)).toEqual(result)
        done();

    })
    it("encrypt 加密 和 decrypt 解密", (done) => {

        let argKey = CryptoJS.enc.Utf8.parse("abacdefageacadfa");
        let argContent = "昔日龌龊不足夸，今朝放荡思无涯。"
        let result = 'lXH5VkIlXI/Os8Mx/Tp4LYx1jfA5hq9mhZjGTFTnSBi/GUbu9M4UBqqj9x9v68ai0vV4ieR+S8sqE8DFiuSvZA=='
        expect(wrapper.vm.encrypt(argKey, argContent)).toEqual(result)
        expect(wrapper.vm.decrypt(argKey, result)).toEqual(argContent)
        done();

    })
})