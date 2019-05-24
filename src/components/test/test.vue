


<template>
  <div
    id="test-vue-id"
    ref="testDom"
    @touchend="touchend"
  >
    <div style="width:400px;height:200px;background:#ccc;margin:10px;">display:block;</div>
    <span style="width:100%;height:200px;background:#eee;margin:10px;">display:inline;</span>
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
    let arr = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 12, 14];
    let start = 0,
      end = arr.length - 1;
    let index = 0;
    let resultIndex = -1;
    let number = 0;
    let i = 10;
    do {
      index = Math.round((start + end) / 2);
      let middle = arr[index];
      if (middle > number) {
        end = index;
      } else if (middle < number) {
        start = index;
      } else {
        resultIndex = index;
        break;
      }
    } while (start < end && i++ < 99999);
    console.log(resultIndex);
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
