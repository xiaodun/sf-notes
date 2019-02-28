


<template>
  <div id="test-vue-id" ref="testDom">
    <form action>
      <input type="name">
      <a href="www.baidu.com" ref="submitDom">提交</a>
    </form>
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
  methods: {
    test(event) {
      console.log(event.detail);
    }
  },
  mounted() {
    let { submitDom } = this.$refs;
    submitDom.addEventListener("alert", () => {
      // alert(1);
    });
    submitDom.dispatchEvent(new Event("alert"), { cancelable: true });
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  width: 200px;
  height: 200px;
}
</style>
