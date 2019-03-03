


<template>
  <div id="test-vue-id" ref="testDom">
    <div class="flex">
      <div class="child">1</div>
      <div class="child">2</div>
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
  methods: {
    test(event) {
      console.log(event.detail);
    }
  },
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  .flex {
    border: 1px solid #000;
    height: 300px;
    display: flex;
    .child {
      border: 1px solid red;
    }
  }
}
</style>
