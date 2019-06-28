


<template>
  <div id="test-vue-id" ref="testDom">
    <div class="bg-wrapper" ref="bgWrapperDom">
      <div ref="collectionWrapperDom" class="collection-wrapper">
        <div
          :key="collectionValues.id"
          v-for="(collectionValues,index) in collectionList"
          class="collection"
          :style="{transform:`translate3d(0,${collectionValues.translateY}px,0)`}"
          @click="onChangeCollection(collectionValues.id)"
          @mousedown="onCollectionMousdown($event,collectionValues.id,index)"
          :class="{active:activeCollectionId === collectionValues.id,hidden:dragCollectionId === collectionValues.id}"
        >{{collectionValues.title}}</div>
      </div>
    </div>
  </div>
</template>

    <script>
let dragCollectionId, //被拖拽元素的id
  cusPos, //被拖动的位置
  activeCollection = {}, //存储被拖动的文集信息
  tempDraggableId = "temp-draggable-id";
export default {
  name: "test_vue",

  data() {
    return {
      dragCollectionId: "-1",
      activeCollectionId: "1",

      collectionList: [
        {
          title: "工具",
          id: "1",
          translateY: 0
        },
        {
          title: "任务",
          id: "2",
          translateY: 0
        },
        {
          title: "收藏的链接",
          id: "3",
          translateY: 0
        },
        {
          title: "高文集",
          id: "4",
          translateY: 0
        },
        {
          title: "Java",
          id: "5",
          translateY: 0
        }
      ]
    };
  },
  components: {},
  computed: {},
  methods: {
    onCollectionMousdown(event, argId, argIndex) {
      dragCollectionId = argId;
      activeCollection.dom = event.currentTarget;
      activeCollection.rect = event.currentTarget.getBoundingClientRect();
      activeCollection.offsetX = event.offsetX;
      activeCollection.offsetY = event.offsetY;
      activeCollection.index = argIndex;
      setTimeout(() => {
        //防止点击也出现移动的效果

        document.addEventListener("mousemove", this.onGlobalMousemove);
      }, 20);
    },
    onChangeCollection(argId) {
      this.activeCollectionId = argId;
    },

    onGlobalMouseup(event) {
      //状态重置
      this.dragCollectionId = "-1";
      document.removeEventListener("mousemove", this.onGlobalMousemove);
      let collectionWrapperDom = this.$refs.collectionWrapperDom;
      collectionWrapperDom.classList.remove("move");
      let tempDraggableDom = document.querySelector(`#${tempDraggableId}`);
      if (tempDraggableDom) {
        //交换位置
        //移除
        let removeCollection = this.collectionList.splice(
          activeCollection.index,
          1
        )[0];
        //加入
        this.collectionList.splice(cusPos, 0, removeCollection);

        this.collectionList.forEach((collection, index, arr) => {
          arr[index].translateY = 0;
        });
        collectionWrapperDom.removeChild(tempDraggableDom);
      }
    },
    onGlobalMousemove(event) {
      this.dragCollectionId = dragCollectionId;
      let collectionWrapperDom = this.$refs.collectionWrapperDom;
      let bgWrapperDom = this.$refs.bgWrapperDom;

      collectionWrapperDom.classList.add("move");
      let tempDraggableDom = document.querySelector(`#${tempDraggableId}`);
      if (!tempDraggableDom) {
        tempDraggableDom = activeCollection.dom.cloneNode(true);
        collectionWrapperDom.appendChild(tempDraggableDom);
      }
      //将新创建的元素与被选中拖拽元素的位置同步 通过top、left
      let tempDraggableDomRect = tempDraggableDom.getBoundingClientRect();
      tempDraggableDom.style.display = "block";
      tempDraggableDom.id = tempDraggableId;

      tempDraggableDom.style.top = activeCollection.rect.top + "px";
      tempDraggableDom.style.left = activeCollection.rect.left + "px";
      tempDraggableDom.style.width = activeCollection.rect.width + "px";
      tempDraggableDom.style.height = activeCollection.rect.height + "px";
      //通过translate来改变元素的位置，来响应拖动
      let translateY =
        event.pageY - activeCollection.rect.top - activeCollection.offsetY;

      tempDraggableDom.style.transform = `translate3d(${event.pageX -
        activeCollection.rect.left -
        activeCollection.offsetX}px,${translateY}px,0)`;

      let moveNumber = Math.round(
        translateY / activeCollection.rect.height + 0.1
      );
      //得到需要移动的元素

      cusPos = activeCollection.index + moveNumber;
      cusPos = cusPos < 0 ? 0 : cusPos;
      cusPos =
        cusPos < this.collectionList.length
          ? cusPos
          : this.collectionList.length - 1;

      let moveCollection = this.collectionList[cusPos];

      cusPos > activeCollection.index
        ? (moveCollection.translateY = -activeCollection.rect.height)
        : (moveCollection.translateY = activeCollection.rect.height);

      //处理元素上下移动的情况
      /**
       * 例如当一个元素下移动时,又向上移动 需要充值当前位置的下一个元素的状态,反之亦然
       */
      if (translateY > 0) {
        this.collectionList[cusPos + 1] &&
          (this.collectionList[cusPos + 1].translateY = 0);
      } else {
        this.collectionList[cusPos - 1] &&
          (this.collectionList[cusPos - 1].translateY = 0);
      }
    }
  },

  mounted() {
    document.addEventListener("mouseup", this.onGlobalMouseup);
  }
};
</script>

<style lang="less" >
@import "~@/assets/style/base.less";

#test-vue-id {
  height: 500px;
  > .bg-wrapper {
    background-color: #404040;

    width: 300px;
    height: 200px;
  }
  .collection-wrapper {
    color: #f2f2f2;
    background-color: #f0f0f0;
    &.move {
      > .collection {
        transition: transform 0.25s ease-in-out;
      }
    }
    > .collection {
      font-size: 15px;
      line-height: 40px;

      position: relative;
      background-color: #404040;
      padding: 0 15px;

      list-style: none;
      transition: none;
      cursor: pointer;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;

      color: #f2f2f2;
      background-color: #404040;

      &.active {
        padding-left: 12px;

        border-left: 3px solid #ec7259;
        background-color: #666;
      }

      &.hidden {
        opacity: 0;
      }
    }
  }

  #temp-draggable-id {
    transition: none;
    position: fixed;
    z-index: 10000;
    visibility: visible;
  }
}
</style>
