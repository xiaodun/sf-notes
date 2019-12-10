<template>
  <div v-highlight class="highlight-vue">
    <slot></slot>
  </div>
</template>
<script>
import Hljs from "highlight.js";
import "highlight.js/styles/googlecode.css";
export default {
  name: "Highlight_vue",
  data() {
    return {};
  },
  directives: {
    highlight: (el) => {
      Hljs.highlightBlock(el);
    },
  },
  methods: {},
  computed: {},
  mounted() {},
};
</script>
<style lang="less">
.highlight-vue {
  background: #e4e4e4;
  padding: 16px;
  margin: 1em 0;
  text-align: left;
}
</style>