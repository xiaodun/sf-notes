


<template>
  <div id="test-vue-id" class="FlexWrapper" wrapper column ref="testDom"></div>
</template>

    <script>
import * as _ from "lodash";
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {},

  mounted() {
    var abc = function(a, b, c) {
      return [a, b, c];
    };

    var curried = _.curry(abc);

    curried(1)(2)(3);
    // => [1, 2, 3]

    curried(1, 2)(3);
    // => [1, 2, 3]

    curried(1, 2, 3);
    // => [1, 2, 3]

    // Curried with placeholders.
    console.log(curried(_, 1)(_, 3)(2));

    // => [1, 2, 3]
  },
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
