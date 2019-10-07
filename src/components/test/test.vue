


<template>
  <div id="test-vue-id" class="FlexWrapper" wrapper column ref="testDom">
    <h1>头部</h1>
    <div class="content"></div>
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

  mounted() {},
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  height: 100vh;

  h1 {
    height: 15vh;

    background-color: red;
  }

  .content {
    background-color: green;

    flex-grow: 1;
  }
}

</style>
