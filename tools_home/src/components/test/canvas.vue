


<template>
  <div id="canvas-vue-id">
    <div>边数:</div>
    <Slider
      v-model="shapeModel.hornNumber"
      :min="0"
      :max="100"
    ></Slider>
    <div>大圆起始角度:</div>
    <Slider
      v-model="shapeModel.bigStartDeg"
      :min="0"
      :max="360"
    ></Slider>
    <div>小圆起始角度:</div>
    <Slider
      v-model="shapeModel.smallStartDeg"
      :min="0"
      :max="360"
    ></Slider>
    <div>大圆的半径:</div>
    <Slider
      v-model="shapeModel.bigR"
      :min="0"
      :max="200"
    ></Slider>
    <div>小圆的半径:</div>
    <Slider
      v-model="shapeModel.smallR"
      :min="0"
      :max="200"
    ></Slider>
    <canvas
      class="star-canvas"
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
    return {
      _context: null,
      shapeModel: {
        bigR: 50,
        hornNumber: 5,
        bigStartDeg: 18,
        smallStartDeg: 54,
        smallR: 30
      }
    };
  },

  computed: {},

  methods: {
    drawShape() {
      let context = this.$data._context;
      let clientRect = this.$refs.canvasDom.getBoundingClientRect();
      context.clearRect(0, 0, clientRect.width, clientRect.height);
      let {
        hornNumber,
        bigR,
        bigStartDeg,
        smallStartDeg,
        smallR
      } = this.shapeModel;

      context.beginPath();
      context.save();

      let maxR = bigR;
      context.translate(
        clientRect.width / 2 - bigR,
        clientRect.height / 2 - bigR
      );
      let list = Array(hornNumber).fill();
      list.forEach((element, index) => {
        let rad = (bigStartDeg + (360 / hornNumber) * index) * (Math.PI / 180);
        let x = bigR - bigR * Math.cos(rad);
        let y = bigR - bigR * Math.sin(rad);
        context.lineTo(x, y);

        let smallRad =
          (smallStartDeg + (360 / hornNumber) * index) * (Math.PI / 180);
        let distance = bigR - smallR;
        let smallX = distance + smallR - smallR * Math.cos(smallRad);
        let smallY = distance + smallR - smallR * Math.sin(smallRad);
        context.lineTo(smallX, smallY);
      });
      context.restore();
      context.closePath();
      context.stroke();
    }
  },
  watch: {
    shapeModel: {
      deep: true,
      handler() {
        this.drawShape();
      }
    }
  },
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
