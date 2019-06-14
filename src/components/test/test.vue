


<template>
  <div
    id="test-vue-id"
    ref="testDom"
  >
    <button @click="onEmit()">emit</button>
    <button @click="onOff()">off</button>
  </div>
</template>

    <script>
class EventTools {
  callBackObj = {};
  on(argKey, argCallback, isOne) {
    if (this.callBackObj.argKey === undefined) {
      this.callBackObj.argKey = new Set();
    }
    this.callBackObj.argKey.add(argCallback);
    console.log(this.callBackObj.argKey);
  }
  emit(argKey) {
    if (this.callBackObj.argKey) {
      for (let callBack of this.callBackObj.argKey) {
        callBack(...[...arguments].slice(1));
      }
    }
  }
  off(argKey, argCallback) {
    if (this.callBackObj.argKey) {
      this.callBackObj.argKey.delete(argCallback);
      console.log(this.callBackObj.argKey);
    }
  }
  once(argKey, argCallback) {
    let _this = this;
    let fn = function() {
      argCallback.apply(null, arguments);

      _this.off(argKey, fn);
    };
    this.on(argKey, fn);
  }
}
let eventTools = new EventTools();
export default {
  name: "test_vue",

  data() {
    return {};
  },
  components: {},
  computed: {},
  methods: {
    onEmit() {
      eventTools.emit("key", 12, 13);
    },
    onOff() {
      eventTools.off("key", this.test);
    },
    test() {
      console.log(arguments);
    }
  },

  mounted() {
    eventTools.once("key", this.test, true);
    eventTools.on("key", this.test);
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  overflow-y: auto;

  width: 100%;
  height: 400px;
  margin: ~"calc((@{layout-header-height} - 24px) / 2)" 0;

  @layout-header-height: 100px;

  main {
  }
}

</style>
