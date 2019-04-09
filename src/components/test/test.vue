


<template>
  <div id="test-vue-id" ref="testDom">
    <button class="antd-btn" @animationend="end" @click="test">测试</button>
  </div>
</template>

    <script>
import axios from "axios";
export default {
  name: "test_vue",

  data() {
    return {
      result: []
    };
  },
  components: {},
  computed: {},
  methods: {
    test(event) {
      let target = event.currentTarget;
      target.setAttribute("ant-click-animating-without-extra-node", "true");
    },
    end(event) {
      let target = event.currentTarget;
      target.setAttribute("ant-click-animating-without-extra-node", "false");
    }
  },
  mounted() {}
};
</script>

<style lang="less" >
@import '~@/assets/style/base.less';

.antd-btn {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.499;

  position: relative;
  position: relative;

  display: inline-block;

  height: 32px;
  padding: 0 15px;

  cursor: pointer;
  -webkit-user-select: none;
     -moz-user-select: none;
      -ms-user-select: none;
          user-select: none;
  -webkit-transition: all .3s cubic-bezier(.645, .045, .355, 1);
          transition: all .3s cubic-bezier(.645, .045, .355, 1);
  text-align: center;
  white-space: nowrap;

  color: rgba(0, 0, 0, .65);
  color: #fff;
  border: 1px solid transparent;
  border-color: #1890ff;
  border-radius: 4px;
  outline: 0;
  background-color: #1890ff;
  background-image: none;
  -webkit-box-shadow: 0 2px 0 rgba(0, 0, 0, .015);
  -webkit-box-shadow: 0 2px 0 rgba(0, 0, 0, .045);
          box-shadow: 0 2px 0 rgba(0, 0, 0, .015);
          box-shadow: 0 2px 0 rgba(0, 0, 0, .045);
  text-shadow: 0 -1px 0 rgba(0, 0, 0, .12);

  -ms-touch-action: manipulation;
      touch-action: manipulation;
}

[ant-click-animating-without-extra-node='true']:after {
  position: absolute;
  top: -1px;
  right: -1px;
  bottom: -1px;
  left: -1px;

  display: block;

  content: '';
  -webkit-animation: fadeEffect 2s cubic-bezier(.08, .82, .17, 1),
  waveEffect .4s cubic-bezier(.08, .82, .17, 1);
          animation: fadeEffect 2s cubic-bezier(.08, .82, .17, 1),
  waveEffect .4s cubic-bezier(.08, .82, .17, 1);
  pointer-events: none;

  opacity: .2;
  border: 0 solid #1890ff;
  border-width: 0;
  border-radius: inherit;

  -webkit-animation-fill-mode: forwards;
          animation-fill-mode: forwards;
}

@keyframes waveEffect {
  100% {
    top: -6px;
    right: -6px;
    bottom: -6px;
    left: -6px;

    border-width: 6px;
  }
}

@keyframes fadeEffect {
  100% {
    opacity: 0;
  }
}

</style>
