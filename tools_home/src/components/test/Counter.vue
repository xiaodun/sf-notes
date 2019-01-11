<style lang='less'>
</style>
<template >
  <button
    id="button-id"
    @click="request"
  >
    {{quantity}}
  </button>
</template>

<script>
export default {
  data() {
    return {
      quantity: ""
    };
  },

  components: {},
  methods: {
    async request() {
      const response = await new Promise(resolve => {
        resolve("wx");
      });

      this.quantity = response;
    }
  },
  watch: {},
  created() {
    // this.request();
  }
};
</script>