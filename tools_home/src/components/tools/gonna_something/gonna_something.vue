<style lang="less">
@import "~@/assets/style/base.less";

#gonna_something-vue-id {
  width: 85%;
  margin: 0 auto;
  .task-config-wrapper {
    padding: 20px 10px;
  }
}
</style>
<template>
  <div id='gonna_something-vue-id'>
    <Steps :current="current">
      <Step
        v-for="(item,index) in stepList"
        :title="item.title"
        :key="index"
        size="small"
      ></Step>
    </Steps>
    <div class="task-config-wrapper">
      <div v-show="current === 0">0</div>
      <div v-show="current === 1">1</div>
      <div v-show="current === 2">2</div>
    </div>
  </div>
</template>
<script>
export default {
  name: "gonna_something_vue",
  data() {
    return {
      current: 0,
      stepList: [
        {
          title: "配置任务"
        },
        {
          title: "分配阀值"
        },
        {
          title: "抽取任务"
        }
      ]
    };
  },
  methods: {},
  computed: {},
  mounted() {}
};
</script>