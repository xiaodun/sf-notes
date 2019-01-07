<style lang="less">
@import "~@/assets/style/base.less";
</style>
<template>
  <div>

  </div>
</template>
<script>
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {};
  },

  computed: {},
  methods: {},
  components: {},

  mounted() {
    function hello() {
      try {
        console.log(1);
        return new Promise((resolve, reject) => {
          setTimeout();
        });
      } catch (e) {
        console.log(4);
        console.log("message", e.message);
        throw e;
      } finally {
        console.log(5);
      }
    }
    function world() {
      try {
        hello();
        console.log(6);
      } catch (e) {
        console.log(7);
        console.log("message", e.message);
      } finally {
        console.log(8);
      }
    }
    world();
  }
};
</script>

