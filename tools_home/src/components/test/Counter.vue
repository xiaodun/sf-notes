<style lang='less'>
#test-vue-id {
  .flex {
    border: 1px solid #000;
    height: 300px;
    .child {
      border: 1px solid red;
    }
  }
}
</style>
<template >
  <div id="test-vue-id">
    <div class="flex">
      <div class="child">1</div>
      <div class="child">2</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },

  components: {},
  methods: {},
  watch: {},
  created() {}
};
</script>