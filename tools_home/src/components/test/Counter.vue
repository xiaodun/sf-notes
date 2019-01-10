<style lang='less'>
</style>
<template >
  <div color='red'>
    <button
      id="opp"
      @click="request"
    >
      {{value}}
    </button>
    <button
      id="opp1"
      @click="request1"
    >
      {{value1}}
    </button>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      count: 0,
      value: "",
      value1: ""
    };
  },

  methods: {
    request() {
      //这里不用加api前缀,因为通过全局设置了
      axios.get("/say/hello").then(res => {
        console.log(res.data);
        this.value = res.data + "";
      });
    },
    request1() {
      axios.get("/say/hello1").then(res => {
        console.log(res.data);
        this.value1 = res.data + "";
      });
    }
  },
  created() {
    this.request();
    this.request1();
  }
};
</script>