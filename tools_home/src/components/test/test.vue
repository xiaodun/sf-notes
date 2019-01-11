

<style lang="less" scoped>
@import "~@/assets/style/base.less";
#test-vue-id {
  .oop {
    width: 200px;
    height: 200px;
    border: 10px solid red;

    // box-shadow: 1px 2px 5px 5px black;
    filter: drop-shadow(1px 2px black);
  }
}
</style>
<template>
  <div id="test-vue-id">
    <div>{{value}}</div>
    <input
      type="text"
      @keypress="keydown"
    >
  </div>
</template>
<script>
import AxiosHelper from "@/assets/lib/AxiosHelper";
export default {
  name: "test_vue",
  data() {
    return {
      value: 12
    };
  },
  props: {},
  computed: {},
  methods: {
    keydown(e) {
      console.log(e);
    }
  },
  components: {
    test: {
      template: `
        <div>{{$parent.value}}</div>
      `
    }
  },

  mounted() {
    console.log("script start");

    setTimeout(function() {
      console.log("setTimeout");
    }, 0);

    Promise.resolve()
      .then(function() {
        console.log("promise1");
      })
      .then(function() {
        console.log("promise2");
      });
  }
};
</script>

