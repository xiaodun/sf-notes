<style lang="less">
@import "~@/assets/style/base.less";
</style>
<template>
  <div>
    <button @click="on_test">点击</button>
  </div>
</template>
<script>
import AxiosHelper from "@/assets/lib/AxiosHelper";
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {};
  },

  computed: {},
  methods: {
    async on_test() {
      await this.request_get_tag().then(res => {
        console.log(res);
      });
      console.log(this.response);
    },
    request_get_tag() {
      return AxiosHelper.request({
        method: "get",
        url: "/personal/word/get"
      });
    }
  },
  components: {},

  mounted() {}
};
</script>

