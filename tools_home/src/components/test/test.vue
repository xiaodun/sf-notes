<style lang="less">
@import "~@/assets/style/base.less";

#login-id {
  line-height: 200px;

  width: 200px;
  height: 200px;
  margin: 100px auto;

  transition: all 0.5s linear;
  text-align: center;

  background: #ccc;
}
</style>
<template>
  <div>

    <div id="login-id">
      密<span style="visibility:hidden;">我</span>码
    </div>
  </div>
</template>
<script>
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {
      isNumber: 2
    };
  },

  computed: {},
  methods: {
    changeNumber() {
      let num = [1, 2, 3];
      let random = Math.random() * 3;
      this.isNumber = num[random | 0];
    }
  },
  components: {
    "my-btn": {
      template: `<div><slot name="lol"></slot>1221</div>`,
      props: {
        isShow: {
          type: Boolean,
          default: false
        }
      },
      mounted() {}
    }
  },

  mounted() {}
};
</script>

