


<template>
  <div id="test-vue-id">
    <div ref="childDom" class="child"></div>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {};
  },
  mounted() {
    let childDom = this.$refs.childDom;
    console.log(window.getComputedStyle(childDom, null).transform);
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";
#test-vue-id {
  .child {
    width: 200px;
    height: 200px;
    background-color: red;
  }
}
</style>
