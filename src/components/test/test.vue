


<template>
  <div
    id="test-vue-id"
    ref="testDom"
  >
    <div class="circle"></div>

  </div>

</template>

    <script>
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {},

  mounted() {
    const user2 = {
      id: 200,
      name: "Vince Noir"
    };

    let renamed = ({ id, ...rest }) => ({ ID: id, ...rest });
    console.log(renamed(user2));
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  .circle {
    width: 100px;
    height: 100px;

    animation: line 1.25s linear both 3;

    border-radius: 50%;
    background-color: red;
  }

  @keyframes line {
    from {
      transform: translate(0px);
    }

    to {
      transform: translate(200px);
    }
  }
}

</style>
