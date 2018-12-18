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

  transition: all .5s linear;

  background: #ccc;
}

</style>
<template>
  <div
    ref="oop"
    id="box"
  >
    <button @click="test">测试</button>
    <todo-list
      ref="time"
      v-bind:todos="todos"
    >
      <!-- 将 `slotProps` 定义为插槽作用域的名字 -->
      <template slot-scope="slotProps">

        <span v-if="slotProps.todo.isComplete">✓</span>
        {{ slotProps.todo.text }}
      </template>

    </todo-list>
  </div>
</template>
<script>
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {
      todos: [
        {
          text: "12321",
          isComplete: true
        }
      ]
    };
  },

  computed: {},
  methods: {
    test() {
      console.dir(this.$refs.time);
      console.log(12);
    }
  },
  components: {
    "todo-list": {
      name: "todo-list",
      comments: true,
      inheritAttrs: true,
      template: `
        <ul>
          <li
            v-for="todo in todos"
            v-bind:key="todo.id"
          >
            <!-- 我们为每个 todo 准备了一个插槽，-->
            <slot v-bind:todo="todo">
              <!-- 回退的内容 -->
              王旭
            </slot>
          </li>
        </ul>
      `,
      props: {
        todos: Array
      },
      mounted() {
        console.dir("wx");
        console.log(this.$refs.time);
      }
    }
  },

  mounted() {
    // console.log("wx", this);
    console.dir(this.$refs.oop);
  }
};
</script>

