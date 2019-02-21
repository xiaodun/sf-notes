


<template>
  <div id="test-vue-id">
    <Menu active-name="1-2" :open-names="names">
      <Submenu name="test-vue">
        <template slot="title">
          <Icon type="ios-analytics"/>Navigation One
        </template>
        <MenuGroup title="Item 1">
          <MenuItem name="1-1">Option 1</MenuItem>
          <MenuItem name="1-2">Option 2</MenuItem>
        </MenuGroup>
        <MenuGroup title="Item 2">
          <MenuItem name="1-3">Option 3</MenuItem>
          <MenuItem name="1-4">Option 4</MenuItem>
        </MenuGroup>
      </Submenu>
      <Submenu name="2">
        <template slot="title">
          <Icon type="ios-filing"/>Navigation Two
        </template>
        <MenuItem name="2-1">Option 5</MenuItem>
        <MenuItem name="2-2">Option 6</MenuItem>
        <Submenu name="3">
          <template slot="title">Submenu</template>
          <MenuItem name="3-1">Option 7</MenuItem>
          <MenuItem name="3-2">Option 8</MenuItem>
        </Submenu>
      </Submenu>
      <Submenu name="4">
        <template slot="title">
          <Icon type="ios-cog"/>Navigation Three
        </template>
        <MenuItem name="4-1">Option 9</MenuItem>
        <MenuItem name="4-2">Option 10</MenuItem>
        <MenuItem name="4-3">Option 11</MenuItem>
        <MenuItem name="4-4">Option 12</MenuItem>
      </Submenu>
    </Menu>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {
      names: ["test-vue"]
    };
  },
  components: {
    A: {
      template: "<h1></h1>"
    },
    a1: {
      template: "<h2></h2>",
      data() {
        return {};
      },
      mounted() {
        console.log(this.index);
      }
    }
  },
  computed: {
    getName() {
      alert(12);
    }
  },
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  width: 200px;
  height: 200px;
}
</style>
