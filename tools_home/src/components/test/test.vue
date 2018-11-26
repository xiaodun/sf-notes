<style lang="less">
.loading-bro {
  font-size: 16px;

  margin: 50px;

  .circle {
    display: inline-block;

    width: 24px;
    height: 24px;
    margin-left: 4px;

    animation: animate 1s infinite;

    border-radius: 50%;

    @keyframes animate {
      0% {
        transform: scale(1);
      }

      50% {
        transform: scale(2);

        opacity: 0.3;
      }

      100% {
        transform: scale(1);
      }
    }
  }

  .generate-circel(@count) when (@count >= 0) {
    .circle-@{count} {
      // background-color: hsl(360, 100% 50%);
      background-color: hsl(10 + @count * 70, 80%, 70%);
    }
    .generate-circel(@count - 1);
  }
  .generate-circel(5);
}

</style>
<template>
  <div class="loading-bro">
    <div class="circle" :style="{'animation-delay':0.1 * (index+1) +'s'}" :class="'circle-'+index" :key="index" v-for="(item,index ) in 5"></div>
  </div>
</template>
<script>
import VConsole from 'vconsole';
// var vConsole = new VConsole();
export default {
  name: 'test_vue',
  data() {
    return {};
  },
  computed: {},
  methods: {},
  mounted() {},
};
</script>

