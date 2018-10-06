<style lang="less">


</style>
<template>
  <div id="app">
    <Modal v-model="isShowQart">
      <div id="qrcode" ref="qrcode"></div>
    </Modal>
    <Button v-if="!is_home" to="/" icon="ios-arrow-back"></Button>
    <Button @click="createQecode();isShowQart = true">二维码</Button>
    <router-view></router-view>
  </div>
</template>
<script>
import QRCode from 'qrcodejs2';
const logo = require("@/assets/logo.png")
export default {
  name: 'App',
  components: {
    QRCode
  },
  data() {
    return {
      is_home:true,
      isShowQart:false,
      config:{
        value:location.href,
        imagePath:logo,
        filter: 'color'
      }
    }
  },
  computed: {

  },
  methods: {
    createQecode(){
      let qrcode = new QRCode('qrcode', {  
      width: 232,  // 设置宽度 
      height: 232, // 设置高度
      text: window.location.href
  })  

    }

  },
  mounted() {
    if(this.$route.path != "/"){
      this.is_home = false;
    }
    
  },
  watch: {
    $route(to,form) {
      this.is_home =  to.path == "/" ? true : false;
    }
  }

}

</script>
