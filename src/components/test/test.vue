


<template>
  <div id="test-vue-id" ref="testDom">
    <div class="wave-wrapper">
      <div class="wave wave1"></div>
      <div class="wave wave2"></div>
      <div class="wave wave3"></div>
    </div>
  </div>
</template>

    <script>
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {},

  mounted() {}
};
</script>

<style lang="less" >
@import '~@/assets/style/base.less';

#test-vue-id {
  overflow-y: auto;

  .wave-wrapper {
    position: relative;

    overflow: hidden;

    width: 100px;
    height: 100px;
    margin: 30px auto;

    border: 1px solid #eee;
    border-radius: 50%;

    .wave {
      position: absolute;
      top: 60px;
      left: 50%;

      width: 200px;
      height: 200px;

      transform: translateX(-30%);
      transform-origin: 50% 50%;
      animation: rotate-cycle linear infinite;

      border-radius: 65px;
      background-color: rgba(0, 162, 255, .7);

      &.wave1 {
        animation-duration: 5s;
      }

      &.wave2 {
        animation-duration: 7s;
      }

      &.wave3 {
        animation-duration: 9s;
      }
    }

    @keyframes rotate-cycle {
      0% {
        transform: translateX(-50%) rotate(0deg);
      }

      100% {
        transform: translateX(-50%) rotate(360deg);
      }
    }
  }
}

</style>
