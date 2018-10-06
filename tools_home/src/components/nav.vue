<template>
  <div id="nav_vue">
    测试分支
  	<router-link to="/test">测试用例</router-link>
    <h2>四则运算</h2>
    <router-link to="/math_postures">版本1</router-link>
    <h2>旋转的时钟</h2>
    <router-link to="/rotate_clock">版本1</router-link>
    <h2>仿照lol盒子的效果</h2>
    <router-link :to="{path:'/lol_box',query:{version:1}}">pc版本1</router-link>
    <router-link :to="{path:'/lol_box',query:{version:2}}">移动版本2</router-link>
    <h2>水波纹效果</h2>
    <router-link to="/wave">版本1</router-link>
    <h2>日记本</h2>
    <router-link to="notepad_vue">日记本</router-link>
    <h2>闹钟</h2>
    <router-link to="clock_vue">pc端版本</router-link>
  </div>
</template>
<script>
export default {
  name: "nav_vue",
  data() {
    return {
      message: "xuxiao is boy"
    }
  },
  
}

</script>
<style lang="less" scoped=>
@import "~@/assets/style/base.less";

</style>
