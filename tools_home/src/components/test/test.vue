


<template>
  <div id="test-vue-id" ref="testDom">
    <div class="flex">
      <Button @click="click($event,1)"></Button>
    </div>
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
  methods: {
    click(event, a) {
      console.log(event, a);
    },
    test(event) {
      console.log(event.detail);
    }
  },
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  .flex {
    border: 1px solid #000;
    height: 300px;
    display: flex;
    flex-wrap: wrap;
    .child {
      width: 400px;
      border: 1px solid red;
    }
  }
}
</style>
