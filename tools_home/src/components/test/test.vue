


<template>
  <div id="test-vue-id">
    <h1>测试用例</h1>
    <div
      class="child"
      v-for="(item,index) in squareConfigList"
      :key="index"
      v-scroll="item"
      v-color="item"
    ></div>
    <canvas v-show="false" ref="canvasDom" width="400" height="400"></canvas>
  </div>
</template>
<script>
export default {
  name: "test_vue",
  components: {},
  directives: {
    color: {
      bind(el, bind) {
        let config = bind.value;
        el.style.background = config.color;
      }
    },
    scroll: {
      bind(el, bind) {
        let threshold = 10;
        let item = bind.value;
        let f = function() {
          let top =
            document.documentElement.scrollTop || document.body.scrollTop;

          if (el.offsetTop - top < window.innerHeight - 10) {
            console.log(el.offsetTop);
            el.style.width = "400px";
            window.removeEventListener("scroll", f);
          }
        };
        setTimeout(() => {
          f();
        }, 20);
        window.addEventListener("scroll", f);
      }
    }
  },
  props: {},
  data() {
    return {
      number: 1,
      squareConfigList: [
        {
          color: "red"
        },
        {
          color: "green"
        },
        {
          color: "yellow"
        },
        {
          color: "black"
        },
        {
          color: "pink"
        },
        {
          color: "purple"
        }
      ]
    };
  },

  computed: {},

  methods: {},
  watch: {},
  mounted() {
    let canvasDom = this.$refs.canvasDom;
    let context = canvasDom.getContext("2d");
    context.beginPath();
    context.lineCap = "butt";
    context.moveTo(20, 20);
    context.lineTo(100, 20);
    context.lineTo(100, 100);
    context.lineWidth = 10;
    context.stroke();
    context.beginPath();
    context.lineJoin = "miter";
    context.lineCap = "round";
    context.moveTo(20, 180);
    context.lineTo(100, 180);
    context.lineTo(100, 280);
    context.lineWidth = 10;
    context.stroke();
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";
#test-vue-id {
  .child {
    width: 200px;
    height: 200px;
    margin: 10px auto;
    transition: width ease-in-out 1.25s;
  }
}
</style>
