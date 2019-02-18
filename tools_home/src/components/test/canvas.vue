


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

  methods: {
    drawShape() {
      let context = this.$data._context;

      context.beginPath();
      context.save();

      let width = 50,
        height = 50,
        radius = 10;
      context.arc(20, 20, 10, Math.PI / 2, Math.PI);
      context.stroke();
      context.restore();
      context.closePath();
    }
  },
  watch: {},

  mounted() {
    let canvasDom = this.$refs.canvasDom;
    this.$data._context = canvasDom.getContext("2d");
    this.drawShape();
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#canvas-vue-id {
  .star-canvas {
    border: 1px solid #000;
  }
}
</style>
