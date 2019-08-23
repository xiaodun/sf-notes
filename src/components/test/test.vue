


<template>
  <div
    id="test-vue-id"
    ref="testDom"
  >
    <div class="circle"></div>

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
@import "~@/assets/style/base.less";

#test-vue-id {
  height: 200px;
  border: 1px solid #000;
  display: flex;
  .circle {
    margin: auto;
    width: 100px;
    background: red;
    height: 100px;
  }
}
</style>
