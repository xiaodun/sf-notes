<template>
  <div class="loading-bro">
    <form action="">
      <input autocomplete="off" type="text" name="username">
      <input @focus="focus" name="password" type="text">
      <button type="submit">提交</button>
    </form>

  </div>
</template>
<script>
import VConsole from "vconsole";
// var vConsole = new VConsole();
export default {
  name: "test_vue",
  data() {
    return {};
  },
  computed: {},
  methods: {
    focus(e) {
      e.target.type = "password";
    }
  },
  mounted() {
    for (let i = 0; i < 10000; i++) {
      if (i % 2) {
        console.count("odds");
      }
      if (!(i % 5)) {
        console.count("multiplesOfFive");
      }
    }
  }
};
</script>
<style></style>
