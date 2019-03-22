


<template>
  <div id="test-vue-id" ref="testDom">
    <div>1</div>
  </div>
</template>
    <script>
export default {
  name: "test_vue",

  data() {
    return {
      result: []
    };
  },
  components: {},
  computed: {},
  methods: {},
  mounted() {
    let a = [1, 2, 3, 8, 0, 2, 1, 10, 9, 6, 4, 5, 1];
    // 0, 1, 1, 1, 2, 2, 3, 4, 5, 6, 8, 9, 10

    console.log(
      a.sort(function(value1, value2) {
        return value1 - value2;
      })
    );
    function quicksort(arr, stack) {
      let start = stack[0],
        end = stack[1];

      let index = arr[start];

      let i = start,
        j = end;

      while (i < j) {
        while (i < j && arr[j] >= index) {
          j--;
        }
        if (i < j) {
          arr[i++] = arr[j];
        }

        while (i < j && arr[i] < index) {
          i++;
        }

        if (i < j) {
          arr[j--] = arr[i];
        }
      }

      arr[i] = index;
      //移除已经使用完的下标
      stack.shift();
      stack.shift();
      //注意要先放入右边数组的下标
      if (i + 1 < end) {
        stack.unshift(i + 1, end);
      }
      if (start < i - 1) {
        stack.unshift(start, i - 1);
      }

      if (stack.length == 0) {
        //排序完成
        return;
      }

      return quicksort(arr, stack);
    }
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
}
</style>
