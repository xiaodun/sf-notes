


    <template>
  <div id="test-vue-id">
    <template v-if="list &&list.length > 0">
      <div
        v-for="(item,index) in list"
        :key="index"
      >{{index}}</div>
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
    for (let i = 0; i < 100; i++) {
      let count = 4 * i - 1;
      if ((count + 2) % 5 === 0) {
        console.log(count);
      }
    }
  }
};
</script>

<style lang="less" >
@import '~@/assets/style/base.less';

</style>
