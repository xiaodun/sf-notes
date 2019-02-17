


<template>
  <div id="canvas-vue-id">
    <canvas
      ref="canvasDom"
      width="400"
      height="400"
    ></canvas>
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
      console.log(context);
      let backgroundCanvas = this.createBackgroundCanvas();

      let pattern = context.createPattern(backgroundCanvas, "repeat-x");
      context.fillStyle = pattern;
      context.fillRect(0, 0, 400, 400);
      context.restore();
      context.closePath();
    },
    createBackgroundCanvas() {
      let backgroundCanvas = document.createElement("canvas");
      console.log(backgroundCanvas);
      backgroundCanvas.width = 200;
      backgroundCanvas.height = 200;
      let backgroundContext = backgroundCanvas.getContext("2d");
      backgroundContext.fillStyle = "red";
      backgroundContext.fillRect(0, 0, 100, 100);
      return backgroundCanvas;
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
@import '~@/assets/style/base.less';

#canvas-vue-id {
  .star-canvas {
    border: 1px solid #000;
  }
}

</style>
