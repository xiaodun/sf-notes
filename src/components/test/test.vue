


<template>
  <div id="test-vue-id" class="FlexWrapper" wrapper column ref="testDom">
    <Button ref="btn">测试</Button>
  </div>
</template>
    <script>
import * as _ from "lodash";
export default {
  name: "test_vue",

  data() {
    return {
      one: "1",
    };
  },
  components: {},
  computed: {},
  methods: {
    test() {},
  },

  mounted() {
    var i = 0;
    const moveZeroes = function(nums) {
      let len = nums.length,
        moveCount = 0;
      for (let i = 0; i < len - moveCount; i++) {
        if (nums[i] === 0) {
          nums.splice(i, 1);
          nums.push(0);
          moveCount++;
          i--;
        }
      }
    };
  },
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
