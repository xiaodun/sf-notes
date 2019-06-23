


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
let dragCollectionId,
  cusPos,
  isScroll = false,
  activeCollection = {},
  lastTranslateY = 0,
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
        },
        {
          title: "TS",
          id: "6",
          translateY: 0
        },
        {
          title: "web",
          id: "7",
          translateY: 0
        },
        {
          title: "优美编程",
          id: "8",
          translateY: 0
        }
      ]
    };
  },
  components: {},
  computed: {},
  methods: {
    onCollectionMousdown(event, argId, argIndex) {
      isScroll = false;
      dragCollectionId = argId;
      activeCollection.dom = event.currentTarget;
      activeCollection.rect = event.currentTarget.getBoundingClientRect();
      activeCollection.offsetX = event.offsetX;
      activeCollection.offsetY = event.offsetY;
      activeCollection.index = argIndex;
      setTimeout(() => {
        document.addEventListener("mousemove", this.onGlobalMousemove);
        document.addEventListener("mouseover", this.onGlobalMouseover);
      }, 20);
    },
    onChangeCollection(argId) {
      this.activeCollectionId = argId;
    },

    onGlobalMouseup(event) {
      this.dragCollectionId = "-1";
      document.removeEventListener("mousemove", this.onGlobalMousemove);
      // document.removeEventListener("mouseover", this.onGlobalMouseover);
      let collectionWrapperDom = this.$refs.collectionWrapperDom;
      collectionWrapperDom.classList.remove("move");
      let tempDraggableDom = document.querySelector(`#${tempDraggableId}`);
      if (tempDraggableDom) {
        //交换位置
        let removeCollection = this.collectionList.splice(
          activeCollection.index,
          1
        )[0];

        this.collectionList.splice(
          cusPos > activeCollection.index ? cusPos : cusPos,
          0,
          removeCollection
        );

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
      let tempDraggableDomRect = tempDraggableDom.getBoundingClientRect();
      tempDraggableDom.style.display = "block";
      tempDraggableDom.id = tempDraggableId;

      tempDraggableDom.style.top = activeCollection.rect.top + "px";
      tempDraggableDom.style.left = activeCollection.rect.left + "px";
      tempDraggableDom.style.width = activeCollection.rect.width + "px";
      tempDraggableDom.style.height = activeCollection.rect.height + "px";

      let translateY =
        event.pageY - activeCollection.rect.top - activeCollection.offsetY;

      tempDraggableDom.style.transform = `translate3d(${event.pageX -
        activeCollection.rect.left -
        activeCollection.offsetX}px,${translateY}px,0)`;

      let currentViewBottomPos =
        bgWrapperDom.offsetHeight + bgWrapperDom.scrollTop;

      let currentViewTopPos = bgWrapperDom.scrollTop;

      let currentDragTopPos =
        translateY +
        (activeCollection.rect.top - collectionWrapperDom.offsetTop);
      let currentDragBottmPos =
        currentDragTopPos + activeCollection.rect.height;

      if (currentDragBottmPos >= currentViewBottomPos) {
        bgWrapperDom.scrollTop +=
          (currentDragBottmPos - currentViewBottomPos) * 10;
        isScroll = true;
      } else if (currentDragTopPos <= currentViewTopPos) {
        bgWrapperDom.scrollTop -= (currentDragTopPos - currentViewTopPos) * 10;
      }

      let moveNumber = Math.round(
        (isScroll ? translateY + bgWrapperDom.scrollTop : translateY) /
          activeCollection.rect.height +
          0.1
      );
      // console.log(translateY);
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
    overflow-y: auto;

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
