


<template>
  <div id="test-vue-id">
    <canvas ref="canvasDom" width="400" height="400"></canvas>
  </div>
</template>
<script>
export default {
  name: "test_vue",
  components: {},

  props: {},
  data() {
    return {};
  },

  computed: {},

  methods: {},
  watch: {},
  mounted() {
    let canvasDom = this.$refs.canvasDom;
    let context = canvasDom.getContext("2d");
    context.beginPath();
    context.save();
    context.translate(100, 100);
    context.lineCap = "butt";
    context.scale(3, 3);
    context.moveTo(20, 20);
    context.lineTo(100, 20);
    context.lineTo(100, 100);
    context.lineWidth = 10;
    context.stroke();
    context.beginPath();
    context.lineJoin = "miter";
    context.translate(100, 100);
    context.moveTo(20, 20);
    context.lineTo(100, 20);
    context.lineTo(100, 100);
    context.lineWidth = 10;
    context.lineWidth = 10;
    context.stroke();
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
