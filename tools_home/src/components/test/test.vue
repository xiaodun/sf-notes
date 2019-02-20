


<template>
  <div id="test-vue-id">
    <svg viewBox="0,0,200,200">
      <A>
        <a1>1</a1>
        <a1>2</a1>
      </A>
    </svg>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {
    A: {
      template: "<h1></h1>"
    },
    a1: {
      template: "<h2></h2>",
      data() {
        return {};
      },
      mounted() {
        console.log(this.index);
      }
    }
  },
  computed: {
    getName() {
      alert(12);
    }
  },
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  width: 200px;
  height: 200px;
}
</style>
