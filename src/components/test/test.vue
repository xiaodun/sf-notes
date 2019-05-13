


<template>
  <div
    id="test-vue-id"
    ref="testDom"
    @touchend="touchend"
  >
    <div
      class="item"
      v-for="(item,index) in list"
      :key="index"
    >{{item}}</div>
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
    touchend(event) {
      let {
        changedTouches: [Touch]
      } = event;
      let threshold = 20;
      let scrollTop = this.$refs.testDom.scrollTop,
        clientHeight = this.$refs.testDom.clientHeight,
        scrollHeight = this.$refs.testDom.scrollHeight;

      if (clientHeight + scrollTop + threshold > scrollHeight) {
        this.list.push(...this.fillList());
      }
    }
  },

  mounted() {
    Array(50)
      .fill()
      .forEach(() => {
        console.log(12);
      });
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  overflow-y: auto;

  width: 100%;
  height: 400px;
}

</style>
