<style lang="less">
.first {
  line-height: 40px;

  position: fixed;

  width: 100%;
  height: 40px;

  transition: all 0.35s;

  background-color: red;
}

#box {
  width: 200px;
  height: 200px;
  margin: 100px auto;

  background: #ccc;
}
</style>
<template>
  <div>
    <button @click="dnf">添加</button>
  </div>
</template>
<script>
export default {
  name: "test_vue",
  data() {
    return {
      threshold: [{ value: 0 }]
    };
  },
  computed: {},
  methods: {
    dnf() {
      // this.threshold[0]++;
      this.threshold[0].value = 12;
      console.log(this.threshold);
    },
    someThod: function(newValue, oldValue) {
      console.log(newValue, oldValue);
    }
  },
  watch: {
    threshold: {
      deep: true,
      handler: function(newValue, oldValue) {
        console.log(newValue, oldValue);
      }
    }
  },
  mounted() {}
};
</script>

