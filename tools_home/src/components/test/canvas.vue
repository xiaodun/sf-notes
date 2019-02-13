


<template>
  <div id="canvas-vue-id">
    <canvas ref="canvasDom" width="400" height="400"></canvas>
  </div>
</template>
<script>
export default {
  name: "canvas_vue",
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
    context.transform(1, 0, 0, 1, 70, 0);
    context.transform(1, 0, 0, 1, 140, 0);
    context.setTransform(1, 0, 0, 1, 0, 0);
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

#canvas-vue-id {
}
</style>
