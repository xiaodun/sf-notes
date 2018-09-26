<template>
  <div id="test_vue">
    <textarea style="overflow:hidden"    @keyup.enter="monitorHeight">
    </textarea>
    <textarea name="" id="" cols="30" rows="10"></textarea>
  </div>
</template>
<script>
import VConsole from 'vconsole';
var vConsole = new VConsole();
export default {
  name: 'test_vue',
  data() {
    return {
      scale:1
    };
  },
  computed: {},
  methods: {
    monitorHeight($event){
      var height = window.getComputedStyle($event.target)["height"];
      // console.log(height);
      // console.dir($event.target);
      $event.target.style.height = $event.target.scrollHeight + ($event.target.offsetHeight - $event.target.clientHeight) + "px";
    },
    pinchmove($event){
      this.scale = $event.scale;
    }
  },
  mounted() {
    setTimeout(function(){

      window.scrollTo(0,1);
    },1000)
    console.log(12)
  }
};

</script>
<style lang="less">

#test_vue {
  height: 1000px;
  #frame{
    margin:0 auto;
    width:100px;
    height:100px;
    background-color: #ccc;
  }
}

</style>
