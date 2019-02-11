


<template>
  <div id="test-vue-id">
    <button @click="isShow= true">测试</button>
    <transition
      appear
      :css="false"
      @before-enter="routerBeforeEnter"
      @enter="routerEnter"
      @after-enter="routerAfterEnter"
    >
      <div class="oop"></div>
    </transition>
    <!-- <transition name="slide-fade">
      <div class="oop" v-if="isShow"></div>
    </transition>-->
  </div>
</template>
<script>
export default {
  name: "test_vue",
  components: {},
  directives: {},
  props: {},
  data() {
    return {
      isShow: false
    };
  },

  computed: {},

  methods: {
    routerBeforeEnter(el) {
      el.style.marginTop = 0;
    },
    routerEnter(el, done) {
      el.style.transition = "2.45s ease-in-out";

      setTimeout(() => {
        done();
      });
    },
    routerAfterEnter(el) {
      el.style.marginTop = 85 + "px";
    }
  },
  watch: {},
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  margin-top: 85px;
  .oop {
    width: 200px;
    height: 200px;
    border: 1px solid #000;
  }
  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }
  .slide-fade-leave-active {
    transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
    transform: translateX(10px);
    opacity: 0;
  }
}
</style>
