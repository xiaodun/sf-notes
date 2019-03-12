


<template>
  <div id="test-vue-id" ref="testDom">
    <mytbale v-bind:items="uesrs">
      <template slot-scope="table">
        <caption>{{table.user.name}}</caption>
      </template>
    </mytbale>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {
      uesrs: [
        { num: 1, name: "h", age: 12 },
        { num: 2, name: "s", age: 13 },
        { num: 3, name: "m", age: 14 }
      ]
    };
  },
  components: {
    mytbale: {
      template: `<table>
                    <slot :user="user"></slot>
                    <thead><th>序号</th><th>名字</th><th>年龄</th></thead>
                    <tbody >
                      <template v-for="item in items">
                        <tr>
                          <td>{{item.num}}</td>
                          <td>{{item.name}}</td>
                          <td>{{item.age}}</td>
                        </tr>
                      </template>
                    </tbody>
                  </table> `,
      props: ["items"],
      data() {
        return {
          user: {
            name: "wx"
          }
        };
      }
    }
  },
  computed: {},
  methods: {},
  mounted() {}
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
