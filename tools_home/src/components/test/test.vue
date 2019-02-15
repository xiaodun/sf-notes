


    <template>
  <div id="test-vue-id">
    <template v-if="list &&list.length > 0">
      <div v-for="(item,index) in list" :key="index">{{index}}</div>
    </template>
    <div v-if="list && list.length === 0">暂无数据</div>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {
      list: null
    };
  },
  mounted() {
    console.log(
      ("00000" + ((Math.random() * 0x1000000) << 0).toString(16)).substr(-6)
    );
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";
</style>
