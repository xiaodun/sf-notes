


<template>
  <div id="test-vue-id" ref="testDom">
    <span style="border:1px solid red;">123</span>
    <button class="antd-btn" @animationend="end" @click="test">测试</button>
  </div>
</template>

    <script>
import axios from "axios";
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
    let total = 20000000;
    let a = 1,
      b = 3;
    let times = 1;
    let count = b;
    do {
      times++;
      let temp = a;
      count += a;
      a = a + b;
      b = temp;
      console.log(count, a, b);
    } while (count < total);
    console.log(times);
  }
};
</script>

<style lang="less" >
@import '~@/assets/style/base.less';

</style>
