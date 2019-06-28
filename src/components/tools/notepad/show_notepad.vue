
<script>
import { BASE64_IMG_PROTOCOL } from "./notepad";
export default {
  name: "show_notepad",
  render(createElement) {
    let imgStuffixList = [".jpg", ".jpeg", ".gif", ".png"];
    // let pattern = RegExp(`(http|https|${BASE64_IMG_PROTOCOL}):\/\/[\\S]+`, "g");
    // \u4e00-\u9fa5 匹配查询参数里的中文
    let pattern = RegExp(
      `(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;\u4e00-\u9fa5]+[-A-Za-z0-9+&@#/%=~_|\u4e00-\u9fa5]`,
      "g"
    );
    let lastIndex = 0;
    let renderList = [];
    let result;
    if (!this.data.content.match(pattern)) {
      //没有动态创建的内容
      renderList.push(this.data.content);
    } else {
      while ((result = pattern.exec(this.data.content)) !== null) {
        if (result.index !== lastIndex) {
          renderList.push(this.data.content.substring(lastIndex, result.index));
        }

        let isImg = imgStuffixList.some(stuffix => {
          if (result[0].endsWith(stuffix)) {
            return true;
          }
        });
        if (isImg) {
          //是图片
          renderList.push(
            createElement(
              "div",
              {
                class: ["img-wrapper"],
                on: {
                  click: this.onZoomImg
                },
                attrs: {
                  "data-src": result[0].startsWith(BASE64_IMG_PROTOCOL)
                    ? this.data.base64[result[0]]
                    : result[0]
                }
              },
              [
                createElement("img", {
                  attrs: {
                    src: result[0].startsWith(BASE64_IMG_PROTOCOL)
                      ? this.data.base64[result[0]]
                      : result[0],
                    title: "点击放大"
                  }
                })
              ]
            )
          );
        } else {
          //是个普通的超链接
          renderList.push(
            createElement("a", {
              attrs: {
                target: "_black",
                href: result[0]
              },
              domProps: {
                innerHTML: result[0]
              }
            })
          );
        }
        lastIndex = pattern.lastIndex;
      }
    }
    //处理后面的元素
    renderList.push(
      this.data.content.substring(lastIndex, this.data.content.length)
    );
    return createElement(
      "div",
      {
        class: ["show-area"]
      },
      renderList
    );
  },
  props: {
    data: {
      type: Object
    }
  },
  methods: {
    onZoomImg(event) {
      this.$emit("onZoomImg", event.currentTarget.getAttribute("data-src"));
    }
  }
};
</script>