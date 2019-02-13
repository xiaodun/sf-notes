


<template>
  <div id="canvas-vue-id">
    <canvas class="star-canvas" ref="canvasDom" width="400" height="400"></canvas>
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

    let hornNumber = 5;
    let bigR = 50;

    let strokeStyle = "yellow";
    let startDeg = 18;
    let smallR = 40;
    let isOpenSmall = true;
    context.beginPath();
    context.save();
    let list = Array(hornNumber).fill();
    list.forEach((element, index) => {
      let rad = (startDeg + (360 / hornNumber) * index) * (Math.PI / 180);
      let x = bigR - bigR * Math.cos(rad);
      let y = bigR - bigR * Math.sin(rad);
      context.lineTo(x, y);
      if (isOpenSmall) {
        let distance = bigR - smallR;
        let smallX = distance + smallR - smallR * Math.cos(rad);
        let smallY = distance + smallR - smallR * Math.sin(rad);
        context.lineTo(smallX, smallY);
      }
    });
    context.restore();
    context.closePath();
    context.stroke();
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
