


<template>
  <div id="test-vue-id" ref="testDom">
    <div>1</div>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {
      result: []
    };
  },
  components: {},
  computed: {},
  methods: {},
  mounted() {
    var obj = {
      name: "wx",
      age: "12"
    };
    var proxy = new Proxy(obj, {
      get: function(origin, key) {
        console.log(origin, key);
      }
    });
    proxy.name;
  }
};
</script>

<style lang="less" >
@import '~@/assets/style/base.less';

</style>
