
<script>
import _ from "lodash";
import { BASE64_IMG_PROTOCOL } from "../../";
import Highlight from "@/components/common/Highlight";
export default {
  name: "show_notepad",
  render(createElement) {
    let renderList = [];
    renderList = this.dealCodeBlock(this.data.content, createElement);
    renderList = this.dealSpecialBlock(renderList, createElement);
    renderList = this.wrapperStrBlock(renderList, createElement);

    return createElement(
      "div",
      {
        class: ["show-area"],
      },
      renderList,
    );
  },
  props: {
    data: {
      type: Object,
    },
  },
  methods: {
    onZoomImg(event) {
      this.$emit("onZoomImg", event.currentTarget.getAttribute("data-src"));
    },
    dealSpecialBlock(argRenderList, argCreateElement) {
      //处理链接‘图片这些元素
      let imgStuffixList = [".jpg", ".jpeg", ".gif", ".png"];
      // let pattern = RegExp(`(http|https|${BASE64_IMG_PROTOCOL}):\/\/[\\S]+`, "g");
      // \u4e00-\u9fa5 匹配查询参数里的中文
      let pattern = RegExp(
        `(https?|ftp|file|${BASE64_IMG_PROTOCOL})://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]`,
        "g",
      );
      let list = [];

      //处理动态创建的内容
      argRenderList.map((content) => {
        if (typeof content === "string") {
          let lastIndex = 0;
          let result;
          while ((result = pattern.exec(content)) !== null) {
            if (result.index !== lastIndex) {
              list.push(content.substring(lastIndex, result.index));
            }

            let isImg = imgStuffixList.some((stuffix) => {
              if (result[0].endsWith(stuffix)) {
                return true;
              }
            });
            if (isImg) {
              //是图片
              list.push(
                argCreateElement(
                  "div",
                  {
                    class: ["img-wrapper"],
                    on: {
                      click: this.onZoomImg,
                    },
                    attrs: {
                      "data-src": result[0].startsWith(BASE64_IMG_PROTOCOL)
                        ? this.data.base64[result[0]]
                        : result[0],
                    },
                  },
                  [
                    argCreateElement("img", {
                      attrs: {
                        src: result[0].startsWith(BASE64_IMG_PROTOCOL)
                          ? this.data.base64[result[0]]
                          : result[0],
                        title: "点击放大",
                      },
                    }),
                  ],
                ),
              );
            } else {
              //是个普通的超链接
              list.push(
                argCreateElement("a", {
                  attrs: {
                    target: "_black",
                    href: result[0],
                  },
                  domProps: {
                    innerHTML: result[0],
                  },
                }),
              );
            }
            lastIndex = pattern.lastIndex;
          }
          //处理后面的元素
          if (lastIndex !== content.length) {
            list.push(content.substring(lastIndex));
          }
        } else {
          list.push(content);
        }
      });
      return list;
    },
    wrapperStrBlock(argRenderList, argCreateElement) {
      //为普通字符串加上div包裹,方便复制
      let list = [];
      argRenderList.forEach((item, index) => {
        if (typeof item === "string" && item.trim() !== "") {
          item.split(/\n/).forEach((str) => {
            let dom = argCreateElement("div", {
              class: {
                line: true,
              },

              domProps: {
                innerText: str,
              },
            });
            list.push(dom);
          });
        } else {
          list.push(item);
        }
      });
      return list;
    },
    dealCodeBlock(argContnet = "", argCreateElement) {
      //筛选出代码块里的内容 暂不考虑代码块嵌套

      let renderList = [];
      let result;
      let flag = "```";
      //记录位置的数组
      let posArr = [0];
      let index;

      while ((index = argContnet.indexOf(flag, index + 1)) !== -1) {
        if (posArr.length < 3) {
          posArr.push(index);
        }

        if (posArr.length == 3) {
          let [first, second, third] = posArr;
          let codeStr = argContnet.substring(second + flag.length + 1, third);
          renderList.push(argContnet.substring(first, second));
          renderList.push(
            argCreateElement(
              "div",
              {
                class: {
                  line: true,
                },
              },
              [
                //  <Button type="default" ghost>Default</Button>
                argCreateElement("Button", {
                  attrs: {
                    type: "primary",
                    ghost: true,
                  },
                  class: {
                    "run-btn": true,
                  },

                  domProps: {
                    innerHTML: "执行",
                  },
                }),
                argCreateElement(Highlight, {
                  key: Math.random(),

                  scopedSlots: {
                    default: () => codeStr,
                  },
                }),
              ],
            ),
          );
          //移除以处理的标记
          posArr = [third + flag.length + 1];
        }
      }

      renderList.push(argContnet.substring(posArr[0]));
      return renderList;
    },
  },
};
</script>