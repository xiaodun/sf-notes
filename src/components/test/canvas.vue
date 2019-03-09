


<template>
  <div id="canvas-vue-id">
    <canvas id="canvas-id" ref="canvasDom" width="400" height="400"></canvas>
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
      let canvasDom = this.$refs.canvasDom;

      context.translate(200, 200);
      let outerR = 50,
        innerX = 100;

      let innerR =
        Math.sqrt(Math.pow(outerR, 2) + Math.pow(innerX, 2)) *
        (outerR / innerX);
      context.arc(0, 0, outerR, 1.5 * Math.PI, 0.5 * Math.PI);
      context.arcTo(innerX, 0, 0, -outerR, innerR);
      context.stroke();
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
  #canvas-id {
  }
}
</style>
