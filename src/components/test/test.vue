


<template>
  <div id="test-vue-id" ref="testDom">
    <div class="item" v-for="(item,index) in list" :key="index">{{item}}</div>
  </div>
</template>

    <script>
export default {
  name: "test_vue",

  data() {
    return {
      list: [],
      startY: 0
    };
  },
  components: {},
  computed: {},
  methods: {
    fillList() {
      let list = Array(50).fill(1);
      list.forEach(
        (el, index, arr) => (arr[index] = (Math.random() * 100) | 0)
      );
      return list;
    },
    touchstart(event) {
      let scrollTop = this.$refs.testDom.scrollTop,
        clientHeight = this.$refs.testDom.clientHeight,
        scrollHeight = this.$refs.testDom.scrollHeight;

      let {
        targetTouches: [Touch]
      } = event;
      // this.startY = targetTouches[]
    },
    touchmove(event) {
      let {
        targetTouches: [Touch]
      } = event;
      console.log(Touch);
    }
  },
  mounted() {
    this.list = this.fillList();
    this.$refs.testDom.addEventListener("touchstart", this.touchstart);
    this.$refs.testDom.addEventListener("touchmove", this.touchmove);
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  width: 100%;
  height: 400px;
  overflow-y: auto;
}
</style>
