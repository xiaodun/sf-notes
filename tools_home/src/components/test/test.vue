<style lang="less">
@import '~@/assets/style/base.less';

</style>
<template>
  <div>
    <achored-heading :level="2">
      测试
    </achored-heading>
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
  components: {
    "achored-heading": {
      render(crateElement) {
        return crateElement("h" + this.level, [
          this.$slots.default,
          crateElement("span", [
            12,
            crateElement(
              "a",
              {
                style: {
                  color: "red"
                },
                class: [
                  {
                    foo: true
                  },
                  "age"
                ],
                attrs: {
                  href: "http://baidu.com"
                }
              },
              "456"
            )
          ])
        ]);
      },
      props: {
        level: Number
      }
    }
  },

  mounted() {}
};
</script>

