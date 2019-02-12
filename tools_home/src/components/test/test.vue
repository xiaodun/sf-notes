


<template>
  <div id="test-vue-id">
    <Select placement="top" v-model="model6" style="width:200px">
      <Option value="beijing">New York</Option>
      <Option value="shanghai" disabled>London</Option>
      <Option value="shenzhen">Sydney</Option>
    </Select>
  </div>
</template>
<script>
export default {
  name: "test_vue",
  components: {},
  directives: {},
  props: {},
  data() {
    return {
      model6: null
    };
  },

  computed: {},

  methods: {},
  watch: {},
  computed: {
    childsStr() {
      console.log(this.childs);
      return JSON.stringify(this.childs);
    }
  },
  mounted() {
    let list = [1, null, undefined];
    for (let i in list) {
      console.log("wx", list[i]);
    }
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
