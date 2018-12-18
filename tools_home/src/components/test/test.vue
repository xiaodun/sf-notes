<style lang="less">
.first {
  line-height: 40px;

  position: fixed;

  width: 100%;
  height: 40px;

  transition: all .35s;

  background-color: red;
}

#box {
  width: 200px;
  height: 200px;
  margin: 100px auto;

  transition: all .5s linear;

  background: #ccc;
}

</style>
<template>
  <div
    ref="oop"
    id="box"
  >

  </div>
</template>
<script>
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {};
  },

  computed: {},
  methods: {},
  components: {},

  mounted() {
    const { length } = "hello";
    console.log(length);
  }
};
</script>

