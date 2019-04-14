


<template>
  <div id="test-vue-id" ref="testDom">
    <Slider v-model="offset" :min="10" :max="314"></Slider>
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="linearGradient-border" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:rgb(255,0,0)"></stop>
          <stop offset="100%" style="stop-color:rgb(0,255,0)"></stop>
        </linearGradient>
      </defs>
      <path
        d="M 50,50 m 0,-40
                a 40,40 0 0 0 0,80 
                 a 40,40 0 0 0 0,-80  "
        stroke-width="5"
        stroke-dasharray="251"
        :stroke-dashoffset="offset"
        style="stroke:url(#linearGradient-border);fill:transparent;"
      ></path>
      <circle id="circle-id" cx="50" cy="10" r="10" style="transform-origin:50px 50px;
 transform: rotate(-60deg);">
        >
      </circle>
    </svg>
 
</svg>
    
  </div>
</template>

    <script>
import axios from "axios";
export default {
  name: "test_vue",

  data() {
    return {
      offset: 100
    };
  },
  components: {},
  computed: {},
  methods: {},
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";
#test-vue-id{
  width:200px;
  height:200px;
}
</style>
