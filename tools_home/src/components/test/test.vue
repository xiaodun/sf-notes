


<template>
  <div
    ref="dnfId"
    id="test-vue-id"
    style="height:1000px;"
  >
    <!-- <div class="child" v-for="(item,index) in colorList" :key="index" v-color="item"></div> -->
    <canvas
      ref="canvasDom"
      width="400"
      height="400"
    ></canvas>
    <input
      type="checkbox"
      :value="12"
      v-model="model"
    >
    <span>{{model}}</span>
    😘🎏

  </div>
</template>
<script>
export default {
  name: "test_vue",
  components: {},
  directives: {
    color: {
      bind(el, bind) {
        let value = bind.value;
        el.style.background = value;
      }
    },
    scroll: {
      bind(el, bind) {
        let key = bind.value + "scroll";
        let f = function() {};
      }
    }
  },
  props: {},
  data() {
    return {
      model: ["苹果"],
      number: 1,
      colorList: ["red", "green", "yellow", "black", "pink", "purple"]
    };
  },

  computed: {},

  methods: {
    set() {
      console.log(1);
    }
  },
  watch: {},
  mounted() {
    let canvasDom = this.$refs.canvasDom;
    let context = canvasDom.getContext("2d");
    context.beginPath();
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

    console.log(String.fromCharCode("🎏"));
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  .child {
    width: 200px;
    height: 0;
    margin: 10px auto;

    transition: height ease-in-out .25s;
  }

  .klo {
    width: 100px;
    height: 10px;

    background-color: red;

    &:focus {
      border: 1px solid #000;
    }
  }
}

</style>
