


<template>
  <div id="test-vue-id" ref="testDom"></div>
</template>

    <script>
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {
    async test() {
      try {
        let testRes = await this.$axios.request({
          url: "/test/test/test",
          method: "post",
        });
        console.log("wx", testRes);
      } catch (error) {
        console.error("错误");
      }
    },
  },

  mounted() {
    this.test();
  },
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  display: flex;

  height: 200px;

  border: 1px solid #000;

  .circle {
    width: 100px;
    height: 100px;
    margin: auto;

    border-radius: 50%;
    background: red;
    background: conic-gradient(red 0 50%, green 50% 60%);
  }
}

</style>
