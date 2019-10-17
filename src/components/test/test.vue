


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

      return nums;
    };

    // const moveZeroes = function(nums) {
    //   let j = 0;
    //   for (let i = 0; i < nums.length; i++) {
    //     if (nums[i] !== 0) {
    //       nums[j] = nums[i];
    //       if (i !== j) {
    //         nums[i] = 0;
    //       }
    //       j++;
    //     }
    //   }

    //   return nums;
    // };

    console.log("wx", moveZeroes([0, 1, 0, 0, 0, 0, 0, 0]));
  },
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
