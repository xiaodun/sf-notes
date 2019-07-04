


<template>
  <div
    id="test-vue-id"
    ref="testDom"
  >
    <a href="1234">测试</a>
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

  mounted() {
    const user2 = {
      id: 200,
      name: "Vince Noir"
    };

    let renamed = ({ id, ...rest }) => ({ ID: id, ...rest });
    console.log(renamed(user2));
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}

</style>
