<style lang="less">
@import '~@/assets/style/base.less';

.parent {
  font-size: 16px;
  line-height: 1.5;
  line-height: 150%;

  height: 40px;
  padding: 10px 20px;

  border: 10px solid #000;
  background-color: red;

  .child {
    font-size: 12px;

    background-color: green;
  }
}

</style>
<template>
  <div>
    <div class="parent">
      <div class="child">12</div>
    </div>
  </div>
</template>
<script>
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {};
  },

  computed: {},
  methods: {},
  components: {},

  mounted() {}
};
</script>

