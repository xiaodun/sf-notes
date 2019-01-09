

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
    <button @click="value++">添加</button>
    <test></test>
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
  methods: {},
  components: {
    test: {
      template: `
        <div>{{$parent.value}}</div>
      `
    }
  },

  mounted() {}
};
</script>

