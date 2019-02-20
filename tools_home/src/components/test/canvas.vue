


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

      context.font = "40px bold Arial";
      context.fillStyle = "black";

      // context.fillRect(0, 0, canvasDom.width, canvasDom.height);

      context.arc(200, 200, 50, 0, 2 * Math.PI, true);
      context.arc(200, 200, 80, 0, 2 * Math.PI, false);
      context.shadowColor = "red";
      context.shadowOffsetX = "10";
      context.fill();
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
