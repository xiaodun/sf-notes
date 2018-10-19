<style lang="less">
@import "~@/assets/style/base.less";
.qrcode-model-wrapper {
  text-align: center;
}
#slide-menu {
  position: fixed;
  top: 0;
  bottom: 0;
  background-color: #fff;
  left: -100%;
  z-index: 12;
  transition: left 0.35s ease-out;
  overflow-y: auto;
  .sf-shadow-5;
  .ivu-menu {
    &:after {
      display: none;
    }
  }

  &.spread {
    left: 0px;
  }
  .arrow-back-btn{
    border-radius:0px;
    font-size:20px;
  }
  
}
#top_wrapper{
  padding: 10px 0;
  margin: 0 0 20px 0;
  border-bottom: 1px solid #ddd;
  .item{
    margin-left: 5px;
  }
}
</style>
<template>
  <div id="app">
    <div id="slide-menu" ref="slideMenu">
     
      <Button class="arrow-back-btn" @click="toggleMenu" icon="ios-arrow-back" type="primary" long size="large"></Button>
      <Row>
        <Col >
        <Menu @on-select="menu_onselect">
          <MenuItem name="0" to="/">
            首页
          </MenuItem>
          <MenuItem name="1">
            手机访问
          </MenuItem>

          <Submenu :key="key" :name="key" v-for="(value,key) in menuData">
            <template slot="title">
              <Icon :type="value.icon" />
              {{value.title}}
            </template>
            <MenuItem :to="item.to" v-for="(item,index) in value.childs" :name="key+'-'+index" :key="key+'-'+index">{{item.content}}</MenuItem>
          </Submenu>

        </Menu>
        </Col>
      </Row>
    </div>
    <Modal class-name="qrcode-model-wrapper" title="用手机扫描" :styles="{display:'inline-block',width:'auto'}" :footer-hide="true" v-model="isShowQart">
      <div id="qrcode" ref="qrcode"></div>
    </Modal>
    <div id="top_wrapper">
      <Button icon="md-menu" class="item" @click="toggleMenu"></Button>
    </div>
    <div id="main-wrapper">

      <router-view></router-view>
    </div>
  </div>
</template>
<script>
import QRCode from "qrcodejs2";
const logo = require("@/assets/logo.png");
export default {
  name: "App",
  components: {
    QRCode
  },
  methods: {
    menu_onselect(name) {
      if (name == 1) {
        this.createQecode();
        this.isShowQart = true;
      }
      this.$refs.slideMenu.classList.remove("spread");
    },
    toggleMenu() {
      this.$refs.slideMenu.classList.toggle("spread");
    },
    createQecode() {
      this.$refs.qrcode.innerHTML = "";
      if(window.location.hostname == "localhost" || window.location.hostname == "127.0.0.1"){
        this.$refs.qrcode.innerHTML = "请确保你连上了网络！"

      }
      else{

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
      is_home: true,
      isShowQart: false,
      config: {
        value: location.href,
        imagePath: logo,
        filter: "color"
      },
      menuData: {
        math_postures_vue: {
          title: "四则运算",
          icon: "ios-calculator",
          childs: [
            {
              content: "版本1",
              to: {
                path: "/math_postures"
              }
            }
          ]
        },
        clock_vue: {
          title: "闹钟",
          icon: "ios-clock-outline",
          childs: [
            {
              content: "pc端版本",
              to: {
                path: "/clock_vue"
              }
            }
          ]
        },
        test_vue: {
          title: "测试",
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
            }
          ]
        }
      }
    };
  },
  computed: {},

  mounted() {
    if (this.$route.path != "/") {
      this.is_home = false;
    }
  },
  watch: {
    $route(to, form) {
      this.is_home = to.path == "/" ? true : false;
    }
  }
};
</script>
