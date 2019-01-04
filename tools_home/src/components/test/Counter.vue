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
  </div>
</template>

<script>
import axios from "axios";
import AxiosHelper from "@/assets/lib/AxiosHelper";
export default {
  data() {
    return {
      count: 0,
      value: ""
    };
  },

  methods: {
    request() {
      axios.get("/say/hello").then(res => {
        this.value = res.data + "";
      });
    }
  },
  created() {
    // this.request();
  }
};
</script>