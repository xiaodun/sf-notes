


<template>
  <div id="test-vue-id" class="FlexWrapper" wrapper column ref="testDom">
    <Button @click="generateList"> 生成10个随机高度的子元素</Button>
    <div class="parent" style="display:none;">
      <div v-for="item in list" :key="item.id" :style="item.style"></div>
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
      list: [],
    };
  },

  components: {},
  computed: {},
  methods: {
    generateList() {
      this.list = Array(10)
        .fill(1)
        .map(() => {
          let child = {
            id: _.uniqueId(),
            style: {
              height: _.random(120) + "px",
              "margin-top": _.random(20) + "px",
              "background-color": "red",
            },
          };
          return child;
        });
    },
  },

  mounted() {
    (function() {
      const apiVersion = "v1";
      const prefix = "api";
      const mapUrlPattern = /{(.*?)}/g;
      const mapUrlObj = {
        apiVersion,
        prefix,
      };
      let url = "{prefix}/door/{apiVersion}/access/room/getAreaRoomInfoTree";
      url = url.replace(mapUrlPattern, (all, key) => {
        let value = mapUrlObj[key] == undefined ? all : mapUrlObj[key];
        return value;
      });

      console.log(url);
    })();
  },
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
