


<template>
  <div id="test-vue-id" class="FlexWrapper" wrapper column ref="testDom">
    
  </div>
</template>
    <script>
import _ from "lodash";
import produce from "immer";
export default {
  name: "test_vue",

  data() {
    return {
      list: [{ id: 1 }, { id: 2 }, { id: 3 }],
    };
  },

  components: {},
  computed: {},
  methods: {},

  mounted() {},
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
