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

  background: #ccc;
}

</style>
<template>
  <div>

    <div
      data-role="page"
      id="pageone"
    >
      <div data-role="header">
        <h1>在此处插入标题</h1>
      </div>

      <div data-role="content">
        <p>在此处插入正文</p>
      </div>

      <div data-role="footer">
        <h1>在此处插入页脚文本</h1>
      </div>
    </div>
  </div>
</template>
<script>
import VConsole from "vconsole";
var vConsole = new VConsole();

export default {
  name: "test_vue",
  data() {
    return {
      threshold: 30,
      startPos: {},
      endPos: {}
    };
  },
  computed: {},
  methods: {},
  mounted() {}
};
</script>

