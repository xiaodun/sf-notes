<script>
export default {
  name: "show_notepad",
  render(createElement) {
    let imgStuffixList = [".jpg", ".jpeg", ".gif", ".png"];
    let pattern = /(http|https):\/\/[\S]+/g;
    let lastIndex = 0;
    let renderList = [];
    let result;
    if (!this.data.match(pattern)) {
      //没有动态创建的内容
      renderList.push(this.data);
    } else {
      while ((result = pattern.exec(this.data)) !== null) {
        if (result.index !== lastIndex) {
          renderList.push(this.data.substring(lastIndex, result.index));
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
                }
              },
              [
                createElement("img", {
                  attrs: {
                    src: result[0],
                    title: "双击放大"
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
      type: String
    }
  },
  methods: {
    onZoomImg() {}
  }
};
</script>