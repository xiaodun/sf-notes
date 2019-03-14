<style lang="less">
@import "~@/assets/style/base.less";

#tag_manager-vue-id {
  .tag {
    margin: 10px 0 5px 0;

    cursor: pointer;

    &:hover {
      .option {
        display: block;
      }
    }

    &.in-edit {
      .option {
        display: block;
      }
    }

    .content {
      line-height: 32px;

      overflow: hidden;

      height: 32px;

      white-space: nowrap;
      text-overflow: ellipsis;

      border-bottom: 1px solid #ccc;
    }

    .option {
      display: none;
      .btn {
        margin-right: 10px;
      }
    }
  }
}
</style>
<template>
  <div id="tag_manager-vue-id">
    <Button class="first-btn" @click="onBack">返回</Button>
    <div class="first">
      <Row>
        <Col span="18">
          <Input v-model.trim="tagName" @on-keyup.enter="onRequestAddTag(tagName)"/>
        </Col>
        <Col span="1" offset="1">
          <Button @click="onRequestAddTag(tagName)" type="primary">添加</Button>
        </Col>
      </Row>
      <div class="tag" :class="{'in-edit':item.isEdit}" :key="item.id" v-for="(item,index) in list">
        <Row>
          <Col span="14">
            <div class="content" v-show="!item.isEdit">{{item.content}}</div>
            <Input ref="updateInputList" v-show="item.isEdit" v-model.trim="item.updateValue"/>
          </Col>
          <Col class="option" span="8" offset="1">
            <Button
              class="btn"
              v-show="!item.isEdit"
              @click="onToggleEdit(item,true,index)"
              shape="circle"
              icon="md-create"
            ></Button>
            <Button
              v-show="!item.isEdit"
              @click="onRquestDelete(item)"
              class="btn"
              shape="circle"
              icon="md-remove"
            ></Button>
            <Button
              class="btn"
              v-show="item.isEdit"
              shape="circle"
              @click="onRequestUpdate(item)"
              icon="md-checkmark"
            ></Button>
            <Button
              class="btn"
              v-show="item.isEdit"
              shape="circle"
              @click="onToggleEdit(item,false,index)"
              icon="md-close"
            ></Button>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "tag_manager_vue",
  model: {
    prop: "list",
    event: "change"
  },
  props: {
    list: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      tagName: "",
      requestPrefix: "/notepad/tag"
    };
  },
  methods: {
    onRequestAddTag(argContent) {
      //提交新增标签

      argContent.length > 0 &&
        this.$axios
          .request({
            method: "post",
            url: this.requestPrefix + "/add",
            data: {
              content: argContent
            }
          })
          .then(response => {
            if (response.data.isFailed) {
              // 当新增标签与已有标签重名时
              this.$Message.warning(response.data.message);
            } else {
              this.tagName = "";
              this.requestGet();
            }
          });
    },

    onRquestDelete(argItem) {
      //提交删除标签
      this.$Modal.confirm({
        title: "删除标签",
        content: "所有绑定了该标签的记事都会移除该标签,这个操作不可逆！",
        onOk: () => {
          this.$axios
            .request({
              method: "post",
              url: this.requestPrefix + "/delete",
              data: {
                id: argItem.id
              }
            })
            .then(response => {
              this.requestGet();
            });
        }
      });
    },
    onRequestUpdate(argItem) {
      argItem.updateValue.length &&
        argItem.updateValue !== argItem.content &&
        this.$axios
          .request({
            method: "post",
            url: this.requestPrefix + "/update",
            data: {
              content: argItem.updateValue,
              id: argItem.id
            }
          })
          .then(response => {
            if (response.data.isFailed) {
              //当新命名的标签与已有标签重名时
              this.$Message.warning(response.data.message);
            } else {
              argItem.isEdit = false;
              argItem.content = argItem.updateValue;
            }
          });
    },
    onToggleEdit(argItem, argFlag, argIndex) {
      argItem.updateValue = argItem.content;
      argItem.isEdit = argFlag;
      argFlag &&
        this.$nextTick(() => {
          this.$refs.updateInputList[argIndex].focus();
        });
    },
    requestGet() {
      //提交获取标签
      this.$axios
        .request({
          method: "post",
          url: this.requestPrefix + "/get"
        })
        .then(response => {
          let list = response.data.map((el, index, arr) => {
            el.updateValue = el.content;
            el.isEdit = false;
            return el;
          });
          this.$emit("change", list);
        });
    },
    onBack() {
      this.$emit("on-back");
    }
  },
  computed: {},
  mounted() {
    this.requestGet();
  }
};
</script>