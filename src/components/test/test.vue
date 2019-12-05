


<template>
  <div id="test-vue-id" class="FlexWrapper" wrapper column ref="testDom">
    <div :key="index" v-for="(item, index) in list">
      <p>{{ item.id }} <Button @click="onDelete(item)">删除</Button></p>
    </div>
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
  methods: {
    onDelete(argItem) {
      _.pullAllBy(this.list, [argItem], "id");

      console.log(this.list.splice === Array.prototype.splice);
      console.log("wx", this.list);
    },
  },

  mounted() {
    let arr = [{ id: 1 }];
  },
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
