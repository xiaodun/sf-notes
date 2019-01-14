<style lang='less'>
</style>
<template >
  <div>

    <button
      id="button-id"
      @click="request"
    >
      {{quantity}}
    </button>
    <textarea
      name=""
      id="test-id"
      cols="30"
      rows="10"
    >212121</textarea>
  </div>
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