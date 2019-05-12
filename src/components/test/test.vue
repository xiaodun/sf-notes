


<template>
  <div
    id="test-vue-id"
    ref="testDom"
  >
    您的浏览器不支持 HTML5 canvas 标签。</canvas>
    <Slider
      v-model="percent"
      :min="0"
      :max="100"
    ></Slider>

    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient
          id="linearGradient-border"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop
            offset="0%"
            :style="{
            'stop-color':this.startColor
          }"
          ></stop>
          <stop
            offset="100%"
            :style="{
            'stop-color':this.endColor
          }"
          ></stop>
        </linearGradient>
      </defs>
      <path
        :d="pathStrings"
        stroke-width="5"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        :style="{
          'stroke':'url(#linearGradient-border)','fill':'transparent',
          'transition':this.transition
        }"
      ></path>
      <circle
        id="circle-id"
        cx="50"
        :cy="boredrWidth"
        :r="dotRadius"
        :style="{
        "
        transform-origin":"50px
        50px", "transform"
        :
        `rotate(${this.dotRotateDeg}deg)`, "fill"
        :this.dotBgColor, "transition"
        :this.transition
        }"
      >></circle>
    </svg>
  </div>
</template>

    <script>
import axios from "axios";
export default {
  name: "test_vue",

  data() {
    return {
      transition: "linear 0.6s",
      dotBgColor: "rgb(255,80,80)",
      percent: 10,
      dotRadius: 5,
      startColor: "rgb(255,0,0)",
      endColor: "rgb(0,255,255)",
      boredrWidth: 10
    };
  },
  components: {},
  computed: {
    dotRotateDeg() {
      return (
        (-180 * ((this.percent / 100) * this.circumference)) /
        (Math.PI * this.radius)
      );
    },
    offset() {
      return this.circumference - (this.percent / 100) * this.circumference;
    },
    circumference() {
      return 2 * Math.PI * this.radius;
    },
    radius() {
      return 50 - this.boredrWidth;
    },
    pathStrings() {
      return `M 50,50 m 0,-${this.radius}
                a ${this.radius},${this.radius} 0 0 0 0,${2 * this.radius} 
                 a ${this.radius},${this.radius} 0 0 0 0,-${2 * this.radius}`;
    }
  },
  methods: {},
  mounted() {
    // let str = "123456789";
    // let pattern = /(\d)(?=(\d{3})+$)/g;
    // console.log(str.replace(pattern, "$1,"));

    let str = "123456789";
    var pattern = /\B(?=((\d{3})+(?!\d)))/g;
   
    console.log( str.replace(pattern, ","));
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  width: 200px;
  height: 200px;
}
</style>
