


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
      console.log(context);
      let img = new Image();
      img.src = "https://img.mukewang.com/images/unknow-80.png";
      img.onload = () => {
        let pattern = context.createPattern(img, "repeat");
        context.fillStyle = pattern;
        context.fillRect(0, 0, 400, 400);
        context.restore();
        context.closePath();
        context.fill();
      };
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
