
<style lang="less">
@import "~@/assets/style/base.less";

.qrcode-model-wrapper {
  text-align: center;
}

#slide-menu {
  position: fixed;
  z-index: 12;
  bottom: 0;
  left: -100%;

  overflow-y: auto;

  transition: left 0.15s ease-in-out;

  background-color: #fff;

  will-change: left;

  .sf-shadow-5;

  .ivu-menu {
    &:after {
      display: none;
    }

    .disabled {
      cursor: pre;
    }
  }

  &.spread {
    left: 0;
  }

  .arrow-back-btn {
    font-size: 20px;

    border-radius: 0;
  }
}

#__vconsole {
  display: none;
}

#main-wrapper {
  transform: translateZ(0);
  margin-top: 0;
  will-change: margin-top;
  transition: margin-top 0.75s ease-in;
}
#top_wrapper {
  font-size: 0;

  position: fixed;
  z-index: 1000;
  top: 0;

  overflow: hidden;

  width: 100%;
  margin: 0 0 20px 0;
  padding: 10px 0;

  white-space: nowrap;
  text-overflow: ellipsis;

  border-bottom: 1px solid #ddd;
  background-color: rgba(255, 255, 255);

  &.box-shadow {
    .sf-shadow-1;
  }

  .item {
    margin-left: 5px;
  }

  .personal-word {
    font-family: "华文细黑";
    font-size: 16px;
    font-weight: 500;

    display: inline-block;

    margin-left: 30px;

    vertical-align: middle;
    letter-spacing: 1px;

    &:hover {
      .pagination {
        visibility: visible;
      }
    }

    .pagination {
      display: inline-block;
      visibility: hidden;

      width: 40px;

      user-select: none;
      text-align: center;
      vertical-align: middle;

      .ivu-icon {
        cursor: pointer;

        &.disabled {
          cursor: not-allowed;
        }
      }

      .page {
        font-size: 12px;
      }

      > :nth-child(n) {
        line-height: 1;

        display: block;
      }
    }
  }
}
</style>
<template>
  <div id="app">
    <div id="slide-menu" :style="[{top:topAreaHeight+'px'}]" ref="slideMenu">
      <Row>
        <Col>
          <Menu @on-select="menu_onselect">
            <MenuItem name="0" to="/">首页</MenuItem>
            <MenuItem name="1">手机访问</MenuItem>
            <MenuItem name="debug">{{!isDebug?'启用调试':'关闭调试'}}</MenuItem>

            <template v-for="(value,key) in menuData">
              <Submenu :key="key" :name="key" v-if="value.childs && value.childs.length > 0">
                <template slot="title">
                  <Icon :type="value.icon"/>
                  {{value.title}}
                </template>
                <MenuItem
                  :to="item.to"
                  v-for="(item,index) in value.childs"
                  :name="key+'-'+index"
                  :key="key+'-'+index"
                >{{item.content}}</MenuItem>
              </Submenu>
              <MenuItem :key="key" :name="key" v-else :to="value.to">
                <Icon :type="value.icon"/>
                {{value.title}}
              </MenuItem>
            </template>
          </Menu>
        </Col>
      </Row>
    </div>
    <Modal
      class-name="qrcode-model-wrapper"
      title="用手机扫描"
      :styles="{display:'inline-block',width:'auto'}"
      :footer-hide="true"
      v-model="isShowQart"
    >
      <div id="qrcode" ref="qrcode"></div>
    </Modal>1
    <div id="top_wrapper" :class="{'box-shadow':isOverScroll}">
      <Button icon="md-menu" class="item" @click="toggleMenu"></Button>
      <div class="personal-word">
        <div class="pagination">
          <Icon
            :class="wordPagination.current === 1 && 'disabled'"
            class="icon"
            type="md-arrow-dropup"
            @click="change_word(wordPagination.current-1)"
          ></Icon>
          <span class="page">
            <span v-text="wordPagination.current" class="current"></span>/
            <span v-text="wordPagination.total" class="total"></span>
          </span>
          <Icon
            @click="change_word(wordPagination.current+1)"
            class="icon"
            :class="wordPagination.current === wordPagination.total && 'disabled'"
            type="md-arrow-dropdown"
          ></Icon>
        </div>
        {{personalWord}}
      </div>
    </div>
    <div v-initial-ani id="main-wrapper">
      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import AxiosHelper from "@/assets/lib/AxiosHelper";
import QRCode from "qrcodejs2";
const logo = require("@/assets/logo.png");
import VConsole from "vconsole";
var vConsole = new VConsole();
const _topAreaHight = 65;
export default {
  name: "App",

  components: {
    QRCode
  },
  directives: {
    "initial-ani"(el) {
      requestAnimationFrame(params => (el.style.marginTop = 100 + "px"));
    }
  },
  methods: {
    routerTransitionEnter(el, done) {
      el.style.marginTop = this.mainWrapperMarginTop + 100 + "px";
      setTimeout(() => {
        done();
      }, 100);
    },

    on_top_scroll() {
      let threshold = this.topAreaHeight - 15;
      let scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      if (scrollTop > threshold) {
        this.isOverScroll = true;
      } else {
        this.isOverScroll = false;
      }
    },
    change_word(argPage) {
      if (argPage < 1 || argPage > this.wordPagination.total) {
        //
      } else {
        this.wordPagination.page = argPage;
        this.request_personal_word(argPage);
      }
    },
    request_personal_word(argIndex) {
      AxiosHelper.request({
        method: "post",
        url: "/personal/word/get",
        data: {
          index: argIndex - 1
        }
      }).then(response => {
        let data = response.data;
        this.personalWord = data.data.content;
        this.wordPagination.current = data.current + 1;
        this.wordPagination.total = data.total;
      });
    },
    menu_onselect(name) {
      if (name == 1) {
        this.createQecode();
        this.isShowQart = true;
      } else if (name === "debug") {
        let vconsoleDom = document.getElementById("__vconsole");
        if (!this.isDebug) {
          vconsoleDom.style.display = "block";
        } else {
          vconsoleDom.style.display = "none";
        }
        this.isDebug = !this.isDebug;
      }
      this.$refs.slideMenu.classList.remove("spread");
    },
    toggleMenu() {
      this.$refs.slideMenu.classList.toggle("spread");
    },
    createQecode() {
      this.$refs.qrcode.innerHTML = "";
      if (
        window.location.hostname == "localhost" ||
        window.location.hostname == "127.0.0.1"
      ) {
        this.$refs.qrcode.innerHTML = "请确保你连上了网络！";
      } else {
        let qrcode = new QRCode("qrcode", {
          width: 232, // 设置宽度
          height: 232, // 设置高度
          text: window.location.href
        });
      }
    }
  },
  data() {
    return {
      topAreaHeight: _topAreaHight,
      mainWrapperMarginTop: _topAreaHight + 20,
      isOverScroll: false,
      isDebug: false,
      personalWord: "",
      is_home: true,
      isShowQart: false,
      wordPagination: {
        page: 1,
        total: 1
      },
      config: {
        value: location.href,
        imagePath: logo,
        filter: "color"
      },
      menuData: {
        math_postures_vue: {
          title: "四则运算",
          icon: "ios-calculator",

          content: "版本1",
          to: {
            path: "/math_postures"
          }
        },
        clock_vue: {
          title: "闹钟",
          icon: "ios-clock-outline",

          content: "pc端版本",
          to: {
            path: "/clock_vue"
          }
        },
        notepad: {
          title: "日记本",
          icon: "md-book",

          content: "版本1",
          to: {
            path: "/notepad_vue"
          }
        },
        img_conventer: {
          title: "图片转换器",
          icon: "md-swap",

          content: "版本1",
          to: {
            path: "/img_conventer"
          }
        },
        gonna_something: {
          title: "let's go",
          icon: "md-walk",

          content: "版本1",
          to: {
            path: "/gonna_something"
          }
        },
        test_vue: {
          title: "测试",
          icon: "ios-game-controller-b",
          childs: [
            {
              content: "测试用例",
              to: {
                path: "/test"
              }
            },
            {
              content: "内置后台node服务",
              to: {
                path: "/test_service"
              }
            },
            {
              content: "canvas",
              to: {
                path: "/test_canvas"
              }
            }
          ]
        }
      }
    };
  },
  computed: {},
  watch: {
    $route(to, form) {
      this.is_home = to.path == "/" ? true : false;
      window.scrollTo(0, 0);
    }
  },
  created() {
    window.addEventListener("scroll", this.on_top_scroll);
  },

  mounted() {
    this.request_personal_word();
    if (this.$route.path != "/") {
      this.is_home = false;
    }
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.on_top_scroll);
  }
};
</script>
