<style lang="less">
@import "~@/assets/style/base.less";

#gonna_something-vue-id {
  width: 85%;
  max-width: 1200px;
  margin: 0 auto;

  .content {
    margin: 10px 0;
  }

  .task-wrapper,
  .extract-wrapper {
    padding: 20px 10px;
  }
  .result-wrapper {
    background-color: #eee;
    width: 100%;
    text-align: center;
    line-height: 220px;
    font-size: 16px;
    height: 220px;
  }
  //显示结果动画
  .result-enter-active,
  .result-leave-active {
    transform: scale(1);
    transition: transform 0.45s ease-in-out;
  }
  .result-enter,
  .result-leave-to {
    transform: scale(0);
  }
  .big-room {
    position: relative;

    overflow-x: hidden;
    overflow-y: visible;

    height: 220px;
    margin: 0 auto;

    .small-wraper {
      width: 1680px;
      margin-top: 10px;
    }

    .small-room {
      line-height: 200px;

      float: left;

      box-sizing: border-box;
      height: 200px;
      margin-top: 10px;
      padding: 0 5px;

      text-align: center;

      border: 10px solid #ddd;
      background: #eee;

      &:first-child {
        padding-left: 0;
      }

      &:last-child {
        padding-right: 0;
      }
    }

    .flag-line {
      position: absolute;

      width: 20px;
      height: 100%;

      border-radius: 10px;
      background-color: #fd3232;

      .sf-shadow-1;
    }
  }
}
</style>
<template>
  <div id="gonna_something-vue-id">
    <Steps :current="current">
      <Step v-for="(item,index) in stepList" :title="item.title" :key="index" size="small"></Step>
    </Steps>

    <div class="task-wrapper">
      <div v-show="current === 0">
        <Checkbox style="margin-bottom:10px;" v-model="isAverage" @on-change="averageThreshold">均分阈值</Checkbox>
        <Button @click="addTask" long>添加</Button>
        <div :key="index" v-for="(item,index) in taskList">
          <table>
            <tr>
              <td>
                <Input
                  ref="contentDomList"
                  style="width:276px"
                  :rows="4"
                  class="content"
                  v-model="item.content"
                  type="textarea"
                />
              </td>

              <td>
                <Slider
                  :disabled="isAverage"
                  style="width:100px;margin:0 10px;"
                  v-model="item.threshold"
                  :min="0"
                  :max="100"
                ></Slider>
              </td>
              <td>
                <InputNumber :readonly="isAverage" style="width:55px" v-model="item.threshold"/>
              </td>
              <td>
                <Button
                  shape="circle"
                  icon="md-close"
                  @click="deleteTask"
                  style="margin-left:10px;"
                ></Button>
              </td>
            </tr>
          </table>
        </div>
        <div style="margin-top:10px">
          <Button v-show="isRightCount()" type="primary" @click="goNextStep(0)">下一步</Button>
          <Button type="error" v-show="!isRightCount()">阈值总数不为100</Button>
        </div>
      </div>
      <div v-show="current === 1">
        <div class="extract-wrapper">
          <transition name="result" mode="out-in">
            <div
              class="result-wrapper"
              v-if="isShowResult"
              key="result"
            >{{resultIndx !== null && taskList[resultIndx].content}}</div>
            <div key="extract" v-else class="big-room" ref="bigRoomDom">
              <div
                ref="smallRoomDomList"
                class="small-room"
                :style="{width:item.threshold+'%'}"
                :key="index"
                v-for="(item,index) in taskList"
              >
                <span style="background:#fff;">{{index}}</span>
              </div>
              <div ref="lineDom" :style="{left:lineModel.left+'px'}" class="flag-line"></div>
            </div>
          </transition>

          <div style="margin:10px 0">
            <Button type="primary" long v-show="status === 'extract'" @click="goExtract">抽取</Button>
            <Button
              type="primary"
              :disabled="stopBtnModel.isDisabled"
              long
              v-show="status === 'stop'"
              @click="goStop"
            >停止</Button>
          </div>
          <Row>
            <Button
              v-show="previousBtnModel.isShow"
              class="previous-setp"
              @click="goPreviousStep(1)"
            >上一步</Button>
          </Row>
        </div>
      </div>
    </div>
    <BackTop :height="200"></BackTop>
  </div>
</template>
<script>
const defaultLineModel = {
  speed: 120,
  left: 5
};
export default {
  name: "gonna_something_vue",
  data() {
    return {
      isShowResult: false,
      status: "extract", //stop
      resultIndx: null,
      stopBtnModel: {
        isDisabled: true,
        timeout: 2000
      },
      lineModel: {
        isStopMove: false,
        seed: 0,
        speed: defaultLineModel.speed,
        dom: null,
        left: defaultLineModel.left,
        timeout: 100
      },
      smallRoomModel: {
        seed: 0,
        speed: 100,
        timeout: 100
      },
      previousBtnModel: {
        isShow: true
      },
      isAverage: true,
      taskList: [],
      current: 0,
      stepList: [
        {
          title: "配置任务"
        },

        {
          title: "抽取任务"
        }
      ]
    };
  },
  computed: {},
  methods: {
    isRightCount() {
      let count = this.taskList.reduce((account, current) => {
        return (account += current.threshold);
      }, 0);
      if (
        (100 - count <= 1 && 100 - count >= 0) ||
        this.taskList.length === 0
      ) {
        return true;
      }

      return false;
    },
    goExtract() {
      this.status = "stop";
      this.previousBtnModel.isShow = false;
      setTimeout(() => {
        this.stopBtnModel.isDisabled = false;
      }, this.stopBtnModel.timeout);

      this.moveLineDom();
    },
    moveLineDom() {
      let bigDom = this.$refs.bigRoomDom;
      let lineDom = this.$refs.lineDom;
      let bigRoomDomRect = bigDom.getBoundingClientRect();
      let lineRoomDomRect = lineDom.getBoundingClientRect();
      this.lineModel.seed = setInterval(() => {
        let { left, speed, isStopMove } = this.lineModel;
        left += speed;
        if (isStopMove) {
          //进行减速
          let value = Math.random() * 10 || 0;
          if (speed > 0) {
            if (speed - value > 0) {
              speed -= value;
            } else {
              this.goResult();
              return;
            }
          } else {
            if (speed + value < 0) {
              speed += value;
            } else {
              this.goResult();
              return;
            }
          }
        }

        if (speed > 0) {
          //往左
          if (left < bigRoomDomRect.width - lineRoomDomRect.width) {
            lineDom.style.left = left + "px";
          } else if (left > bigRoomDomRect.width - lineRoomDomRect.width) {
            left = bigRoomDomRect.width - lineRoomDomRect.width;
            lineDom.style.left = left + "px";
            speed = -speed;
          }
        } else {
          //往右
          if (left > 0) {
            lineDom.style.left = left + "px";
          } else if (left < 0) {
            left = 0;
            lineDom.style.left = left + "px";
            speed = -speed;
          }
        }

        this.lineModel = { ...this.lineModel, ...{ left, speed } };
      }, this.lineModel.timeout);
    },
    goStop() {
      this.lineModel.isStopMove = true;
    },
    goResult() {
      //判断lineDom停在了哪里。

      this.previousBtnModel.isShow = true;
      clearInterval(this.lineModel.seed);
      let smallRoomDomList = this.$refs.smallRoomDomList;
      let lineDom = this.$refs.lineDom;
      let lineRoomDomRect = lineDom.getBoundingClientRect();
      let index;
      for (let i = 0; i < smallRoomDomList.length - 1; i++) {
        let previousDomClientRect = smallRoomDomList[i].getBoundingClientRect();
        let nextDomClientRect = smallRoomDomList[i + 1].getBoundingClientRect();

        if (
          lineRoomDomRect.left > previousDomClientRect.left &&
          lineRoomDomRect.left < nextDomClientRect.left
        ) {
          index = i;
          break;
        }
      }
      if (index === undefined) {
        //如果不在前面则在最后一个
        index = smallRoomDomList.length - 1;
      }

      //准备动画
      this.resultIndx = index;
      this.isShowResult = true;
    },
    onLevaeConfirm() {
      if (this.taskList.length > 0 && this.current === 0) {
        return true;
      }
    },
    addTask() {
      this.taskList.unshift({
        content: "",
        threshold: 0
      });
      this.$nextTick(() => {
        this.$refs.contentDomList[0].focus();
      });
      if (this.isAverage) {
        this.averageThreshold();
      }
    },
    averageThreshold() {
      let value = (100 / this.taskList.length) | 0;
      this.taskList.forEach(element => {
        element.threshold = value;
      });
    },
    deleteTask(argIndex) {
      this.taskList.splice(argIndex, 1);
      if (this.isAverage) {
        this.averageThreshold();
      }
    },
    goNextStep(argNumber) {
      this.current += 1;
    },
    goPreviousStep(argNumber) {
      if (argNumber === 1) {
        //恢复初始状态
        this.status = "extract";
        this.isShowResult = false;
        this.resultIndx = null;
        Object.assign(this.lineModel, defaultLineModel, { isStopMove: false });
      }
      this.current -= 1;
    }
  },
  mounted() {
    window.onbeforeunload = this.onLevaeConfirm;
  },
  beforeDestroy() {
    window.onbeforeunload = null;
  }
};
</script>