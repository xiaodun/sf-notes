


<template>
  <div
    id="test-vue-id"
    ref="testDom"
  >
    <div
      ref="collectionWrapperDom"
      class="collection-wrapper"
    >

      <div
        :key="collectionId"
        v-for="(collectionValues,collectionId,index) in collectionObject"
        class="collection "
        @click="onChangeCollection(collectionId)"
        @mousedown="onCollectionMousdown($event,collectionId,index)"
        :class="{active:activeCollectionId === collectionId,hidden:dragCollectionId === collectionId}"
      >
        {{collectionValues.title}}
      </div>

    </div>
    <div class="drop-area">
      {{name}}
    </div>
  </div>
</template>

    <script>
let dragCollectionId,
  activeCollection = {},
  tempDraggableId = "temp-draggable-id";
export default {
  name: "test_vue",

  data() {
    return {
      dragCollectionId: "-1",
      activeCollectionId: "1",
      name: "wx",
      collectionObject: {
        "1": {
          title: "工具"
        },
        "2": {
          title: "任务"
        },
        "3": {
          title: "收藏的链接"
        },
        "4": {
          title: "高文集"
        },
        "5": {
          title: "Java"
        }
      }
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
        document.addEventListener("mousemove", this.onGlobalMousemove);
      }, 20);
    },
    onChangeCollection(argId) {
      this.activeCollectionId = argId;
    },

    onGlobalMouseup(event) {
      this.dragCollectionId = "-1";
      document.removeEventListener("mousemove", this.onGlobalMousemove);
      let collectionWrapperDom = this.$refs.collectionWrapperDom;
      let tempDraggableDom = document.querySelector(`#${tempDraggableId}`);
      if (tempDraggableDom) {
        console.log(collectionWrapperDom);
        collectionWrapperDom.removeChild(tempDraggableDom);
      }
    },
    onGlobalMousemove(event) {
      let collectionWrapperDom = this.$refs.collectionWrapperDom;
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

      console.log(translateY / activeCollection.rect.height);

      this.dragCollectionId = dragCollectionId;
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
  > .collection-wrapper {
    overflow-y: auto;

    width: 300px;
    height: 600px;

    color: #f2f2f2;
    background-color: #404040;

    > .collection {
      font-size: 15px;
      line-height: 40px;

      position: relative;

      padding: 0 15px;

      list-style: none;

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

  .drop-area {
    position: absolute;
    top: 100px;
    left: 300px;

    width: 100px;
    height: 100px;

    border: 1px solid #000;
  }

  > .draggable-collection-wrapper {
    position: fixed;
  }

  #temp-draggable-id {
    position: fixed;

    visibility: visible;
  }
}

</style>
