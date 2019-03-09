


<template>
  <div id="test-vue-id" ref="testDom">
    {{time}}
    <div>
      <button @touchstart="onTouchStart" @click="onEnd">clickBtn</button>
    </div>
    <div>
      <button @touchstart="onTouchStart" @touchend="onEnd">touchBtn</button>
    </div>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {
      time: "",
      startTime: ""
    };
  },
  components: {},
  computed: {},
  methods: {
    onTouchStart() {
      this.startTime = new Date();
    },
    onEnd(event) {
      console.log(event);
      this.time = Date.now() - this.startTime;
    }
  },
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
