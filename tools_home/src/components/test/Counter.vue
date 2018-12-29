<style lang='less'>
</style>
<template >
  <div color='red'>
    {{ count }}
    <button
      name="123"
      @click="increment"
    >自增</button>
  </div>
</template>

<script>
export default {
  props: {
    bar: ""
  },
  data() {
    return {
      count: 0
    };
  },

  methods: {
    increment() {
      this.count++;
    }
  }
};
</script>