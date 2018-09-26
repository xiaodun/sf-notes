<style lang="less">


</style>
<template>
  <div id="app">
    <Button v-if="!is_home" to="/" icon="ios-arrow-back"></Button>
    <router-view></router-view>
  </div>
</template>
<script>
export default {
  name: 'App',
  components: {

  },
  data() {
    return {
      is_home:true
    }
  },
  computed: {

  },
  methods: {

  },
  created(){
    console.log(123)
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
