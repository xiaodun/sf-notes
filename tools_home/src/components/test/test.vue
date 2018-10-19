<template>
  <div id="test_vue">
    <textarea style="overflow:hidden"    @keydown.enter="monitorHeight">
    </textarea>
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
      
      $event.target.style.height = $event.target.scrollHeight + ($event.target.offsetHeight - $event.target.clientHeight) + "px";
    },
    pinchmove($event){
      this.scale = $event.scale;
    }
  },
  mounted() {
  
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
