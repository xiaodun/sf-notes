

<style lang="less" scoped>
@import "~@/assets/style/base.less";
#test-vue-id {
  display: flex;
  .pillar {
    width: 50px;
    height: 20px;
    margin-left: 10px;
    background-color: red;
  }
}
</style>
<template>
  <div id="test-vue-id">
    <div
      class="pillar"
      v-for="i in 10"
      :key="i"
      :style="{height:i*10+'px'}"
    ></div>

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
  props: {
    number: Number | String
  },
  computed: {},
  methods: {},
  components: {},

  mounted() {}
};
</script>

