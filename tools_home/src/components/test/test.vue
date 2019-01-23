


<template>
  <div id="test-vue-id" style="height:1000px;">
    <div class="child" v-for="(item,index) in colorList" :key="index" v-color="item"></div>
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
      number: 1,
      colorList: ["red", "green", "yellow", "black", "pink", "purple"]
    };
  },

  computed: {},

  methods: {
    set() {
      console.log(12);
    }
  },
  watch: {},
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";
#test-vue-id {
  .child {
    width: 200px;
    height: 0px;
    margin: 10px auto;
    transition: height ease-in-out 0.25s;
  }
}
</style>