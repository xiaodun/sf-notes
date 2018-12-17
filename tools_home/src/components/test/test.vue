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
  <div id="box">

  </div>
</template>
<script>
let num = 0;
export default {
  name: "test_vue",
  data() {
    return {
      checked: true,
      message: {
        // name: "wx"
      },
      threshold: [{ value: 0 }]
    };
  },
  mixins: [
    {
      data: function() {
        return {
          message: {
            name: "wx1"
          }
        };
      },
      methods: {
        dnf() {
          alert(1);
        }
      }
    }
  ],
  computed: {},
  methods: {
    add() {
      num += 30;
    },
    show() {
      alert(num);
    },
    dnf() {
      this.$parent.isDebug = true;
    },
    someThod: function(newValue, oldValue) {}
  },
  watch: {},
  mounted() {}
};
</script>

