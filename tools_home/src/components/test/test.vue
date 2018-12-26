<style lang="less">
@import "~@/assets/style/base.less";

#login-id {
  line-height: 200px;

  width: 200px;
  height: 200px;
}
</style>
<template>
  <div>

    <div id="login-id">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Culpa fugit delectus, et nihil deserunt porro natus. Commodi dolor ipsa, voluptates assumenda consectetur ducimus officia esse quae consequatur. Laudantium, odio corrupti!
    </div>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus delectus expedita eaque illum laudantium, accusamus ullam laborum ipsum error commodi sapiente alias officia iure consequuntur ducimus nulla praesentium. Eveniet, sapiente. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Velit temporibus alias reprehenderit, expedita vitae magnam enim eligendi mollitia et quibusdam aperiam natus minus laborum labore eveniet minima. A numquam quam quidem, sint dolore, ab excepturi minus natus tenetur veritatis corporis suscipit eum, cumque maxime modi omnis molestiae. Necessitatibus tenetur nobis exercitationem ex aspernatur architecto fuga mollitia, reprehenderit vitae nesciunt odit, soluta accusamus quod amet? Dolore, libero dolorem. At, quae inventore expedita necessitatibus aperiam rem, dolorum, tempore officia explicabo consequatur iste dolorem? Delectus in ab laborum, aspernatur ullam ipsa recusandae sapiente, velit at labore distinctio deleniti fuga sed accusantium consequatur, neque hic. Aliquam quisquam aliquid aspernatur, repellat, ut obcaecati amet dolor iste deserunt soluta officia ea alias laboriosam. Laborum quas veniam rerum officiis, at saepe voluptatibus aut. Iste quaerat tenetur consectetur similique ea aut error architecto. Explicabo reprehenderit, sapiente dolor nihil saepe incidunt. At fuga officiis cum dicta non? Dicta dolor facilis, ullam amet perferendis aut atque rem voluptates voluptatem a. Quod atque est voluptate saepe eius asperiores qui. Voluptatum in eius, deleniti qui sunt dolorem blanditiis iste officia commodi illum nam quam impedit. Eum tenetur est fugiat numquam necessitatibus natus ipsam veniam eos reprehenderit. Libero aliquid rem quidem excepturi assumenda?</p>
    <button @click="test">测试</button>
  </div>
</template>
<script>
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {
      isNumber: 2,
      _number: 0
    };
  },

  computed: {},
  methods: {
    test() {
      console.log(this.$data._number);
    },
    changeNumber() {
      let num = [1, 2, 3];
      let random = Math.random() * 3;
      this.isNumber = num[random | 0];
    }
  },
  components: {
    "my-btn": {
      template: `<div><slot name="lol"></slot>1221</div>`,
      props: {
        isShow: {
          type: Boolean,
          default: false
        }
      },
      mounted() {}
    }
  },

  mounted() {
    var a = 2;
    window.say = function(a) {
      console.log(a);
    };
    function test() {
      let a = 1;
      setTimeout("say(a)", 0);
    }
    test(); //2
  }
};
</script>

