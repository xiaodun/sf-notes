

<style lang="less" >
@import "~@/assets/style/base.less";
#test-vue-id {
}
</style>
<template>
  <div id="test-vue-id">
    <textarea
      name=""
      id="testid"
      cols="30"
      rows="10"
    >212121</textarea>
    <test-com ref="dom"></test-com>
    <button  @click="test">调用</button>
  </div>
</template>
<script>
export default {
  name: "test_vue",
  data() {
    return {};
  },
  props: {},
  computed: {},
  methods: {
    test(){
      this.$emit('wait',12)
    }
  },
  components: {
    'test-com':{
      template:`<div><button>broadcast调用</button><br/><button @click="on_dispatch">dispatch调用</button></div>`,
      data(){
        return{

        }
      },
      methods:{
        ref_say(){
          alert('我被调用了')
        },
        on_dispatch(value){
          this.$parent.$emit('wait')
        }
      }
    }
  },
  
  mounted() {
    this.$on("wait",function(value){
      alert(value)
    })
  }
};
</script>

