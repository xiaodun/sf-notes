


<template>
  <div id="test-vue-id">
    <main>123</main>
  </div>
</template>

    <script>
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {},

  mounted() {
    let str = `aa "55" $c b
               nn (8*) q 12
               true sdc 12 2w2`;

    let list = [];
    str.split("\n").forEach((row, index) => {
      list[index] = [];
      row
        .trim()
        .split(/\s/)
        .forEach(item => {
          list[index].push(item);
        });
    });
    console.log(list);
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  overflow-y: auto;

  width: 100%;
  height: 400px;

  main {
  }
}

</style>
