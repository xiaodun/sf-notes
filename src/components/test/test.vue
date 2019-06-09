


<template>
  <div id="test-vue-id" ref="testDom">
    <span>123</span>
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
    var obj1 = {
      name: "obj1"
    };
    var obj2 = {
      name: "obj2"
    };
    var obj3 = {
      name: "obj3"
    };
    function say() {
      console.log(this.name);
    }
    var fn = say
      .bind(obj1)
      .bind(obj2)
      .bind(obj3);
    fn();
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  overflow-y: auto;

  width: 100%;
  height: 400px;

  main {
  }
}
</style>
