


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
    const [boxes, cols, rows] = [7, 8, 8].map((v) =>
      Array(v)
        .fill(1)
        .map(() => ({})),
    );
    boxes[5][5] = true;
    console.log(boxes, cols, rows);
  },
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
