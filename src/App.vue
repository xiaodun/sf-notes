
<style lang="less">
@import '~@/assets/style/base.less';

.qrcode-model-wrapper {
  text-align: center;
}

#slide-menu {
  position: fixed;
  z-index: 12;
  bottom: 0;
  left: -100%;

  overflow-x: hidden;
  overflow-y: auto;

  transition: left .15s ease-in-out;

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

  .ivu-menu-item.user {
    position: relative;

    height: 50px;

//解决Ctrl+鼠标点击路由时跳转不正常  重置样式
    padding: 0;

    &.ivu-menu-item-selected,
    &:hover {
      a {
        color: #2d8cf0;
      }
    }

    &.sub {
      padding-left: 0 !important;

      a {
        padding-left: 43px;
      }
    }

    a {
      position: absolute;

      width: 100%;
      height: 100%;
      padding: 14px 24px;

      color: #515a6e;
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
  padding-top: 0;
  padding-bottom: 15px;

  transition: padding-top .75s ease-in;
  transform: translateZ(0);

  will-change: padding-top;
}

#top_wrapper {
  font-size: 0;

  position: fixed;
  z-index: 1000;
  top: 0;

  display: flex;
  overflow: hidden;
  align-items: center;

  width: 100%;
  margin: 0 0 20px 0;
  padding: 10px 0;

  white-space: nowrap;
  text-overflow: ellipsis;

  border-bottom: 1px solid #ddd;
  background-color: rgb(255, 255, 255);

  &.box-shadow {
    .sf-shadow-1;
  }

  .menu-btn {
    flex-shrink: 0;

    margin-left: 15px;
  }

  .item {
    margin-left: 5px;
  }

  .personal-word {
    font-family: '华文细黑';
    font-size: 16px;
    font-weight: 500;

    overflow-x: auto;
    overflow-y: hidden;
    flex-grow: 1;

    margin-left: 15px;
    padding-right: 10px;

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
          <Menu
            ref="slideMenuIview"
            @on-select="menu_onselect"
            :active-name="activeMenuName"
            :open-names="activeSubName"
          >
            <MenuItem name="0" to="/">首页</MenuItem>
            <MenuItem name="1">手机访问</MenuItem>
            <MenuItem v-show="$browserMessage.isMobile" name="debug">{{!isDebug?'启用调试':'关闭调试'}}</MenuItem>

            <template v-for="(value,key) in menuData">
              <Submenu
                v-if=" (($browserMessage.isMobile && value.isShowMobile )|| $browserMessage.isPC )&& value.childs && value.childs.length > 0"
                :key="key"
                :name="key"
              >
                <template slot="title">
                  <Icon :type="value.icon"/>
                  {{value.title}}
                </template>
                <MenuItem
                  v-if="($browserMessage.isMobile && item.isShowMobile )|| $browserMessage.isPC "
                  class="user sub"
                  v-for="(item,index) in value.childs"
                  :name="key+'-'+index"
                  :key="key+'-'+index"
                >
                  <!-- 解决Ctrl+鼠标点击路由时跳转不正常 -->
                  <a :href="'#'+item.to.path">{{item.content}}</a>
                </MenuItem>
              </Submenu>
              <MenuItem
                class="user"
                :key="key"
                :name="key"
                v-else-if="($browserMessage.isMobile && value.isShowMobile )|| $browserMessage.isPC "
              >
                <!-- 解决Ctrl+鼠标点击路由时跳转不正常 -->
                <a :href="'#'+value.to.path">
                  <Icon :type="value.icon"/>
                  {{value.title}}
                </a>
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
    </Modal>
    <div id="top_wrapper" :class="{'box-shadow':isOverScroll}">
      <Button class="menu-btn" ref="menuButtonIview" icon="md-menu" @click="toggleMenu"></Button>
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
import VConsole from "vconsole";
import Vue from "vue";
let vconsole;
const _topAreaHight = 65;
export default {
  name: "App",

  components: {
    QRCode
  },
  directives: {
    "initial-ani"(el) {
      setTimeout(params => (el.style.paddingTop = 100 + "px"), 20);
    }
  },
  methods: {
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
      let path = this.$router.history.current.fullPath;
      if (name === "1") {
        this.createQecode();
        this.isShowQart = true;
      } else if (name === "debug") {
        if (!vconsole) {
          vconsole = new VConsole();
        }
        let vconsoleDom = document.getElementById("__vconsole");
        if (!this.isDebug) {
          vconsoleDom.style.display = "block";
        } else {
          vconsoleDom.style.display = "none";
        }
        this.isDebug = !this.isDebug;
      }

      if (name === "1" || name === "debug") {
        //不进行菜单选择
        //如果不重置 this.activeMenuName还是上一个路由的值
        this.activeMenuName = "";
        setTimeout(() => {
          this.selectedMenu(path);
        }, 20);
      }
      this.$refs.slideMenu.classList.remove("spread");
    },
    toggleMenu() {
      this.$refs.slideMenu.classList.toggle("spread");
    },
    selectedMenu(argPath) {
      //选中菜单  如果放在mounted中不能打开子级菜单

      this.activeMenuName = "";

      for (let key in this.menuData) {
        let item = this.menuData[key];
        if (item.childs && item.childs.length > 0) {
          let isMatch = item.childs.some((element, index) => {
            if (element.to.path === argPath) {
              this.activeMenuName = key + "-" + index;
              return true;
            }
          });
          if (isMatch) {
            this.activeSubName = [key];

            break;
          }
        } else {
          if (item.to.path === argPath) {
            this.activeMenuName = key;
            this.activeSubName = [];
            break;
          }
        }
      }

      if (this.activeMenuName === "") {
        this.activeMenuName = "0";
        this.activeSubName = [];
      }

      this.$nextTick(() => {
        //下面两个方法时iview提供的 不调用无法更新子级菜单
        this.$refs.slideMenuIview.updateOpened();
        this.$refs.slideMenuIview.updateActiveName();
      });
    },
    hideMenu(e) {
      //点击其他地方收起侧边栏  发生在捕获阶段
      let slideMenu = this.$refs.slideMenu;
      let menuButtonDom = this.$refs.menuButtonIview.$el;

      if (
        //不是侧边栏里面的元素
        (slideMenu.compareDocumentPosition(e.target) & 16) === 0 &&
        //不是触发按钮本身
        e.target !== menuButtonDom &&
        //不是触发按钮里面的元素

        (menuButtonDom.compareDocumentPosition(e.target) & 16) === 0
      ) {
        if (slideMenu.classList.contains("spread")) {
          this.toggleMenu();
        }
      }
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
      activeMenuName: "",
      activeSubName: [],
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
          isShowMobile: true,
          content: "版本1",
          to: {
            path: "/math_postures"
          }
        },
        clock_vue: {
          title: "闹钟",
          isShowMobile: true,
          icon: "ios-clock-outline",

          content: "pc端版本",
          to: {
            path: "/clock_vue"
          }
        },
        notepad: {
          title: "日记本",
          icon: "md-book",
          isShowMobile: true,
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
          isShowMobile: true,
          childs: [
            {
              content: "测试用例",
              isShowMobile: true,
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
      this.selectedMenu(to.path);
    }
  },
  created() {
    window.addEventListener("scroll", this.on_top_scroll);

    document.addEventListener("click", this.hideMenu, true);
  },

  mounted() {
    this.request_personal_word();
    if (this.$route.path != "/") {
      this.is_home = false;
    }
  },
  beforeDestroy() {
    document.removeEventListener("click", this.hideMenu, true);
    window.removeEventListener("scroll", this.on_top_scroll);
  }
};
</script>
