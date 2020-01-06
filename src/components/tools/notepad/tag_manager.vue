<style lang="less">
@import "~@/assets/style/base.less";

#tag_manager-vue-id {
  .tag {
    margin: 10px 0 5px 0;

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

      @media screen and (max-width: 960px) {
        display: block;
      }
    }
  }
}
</style>
<template>
  <div id="tag_manager-vue-id">
    <Button class="first-btn" @click="$emit('on-back')">返回</Button>
    <div class="first">
      <Row>
        <Col span="18">
          <Input v-model.trim="tagName" @on-keyup.enter="onAdd(tagName)" />
        </Col>
        <Col span="1" offset="1">
          <Button @click="onAdd(tagName)" type="primary">添加</Button>
        </Col>
      </Row>
      <div
        class="tag"
        :class="{ 'in-edit': item.isEdit }"
        :key="item.id"
        v-for="(item, index) in list"
      >
        <Row>
          <Col span="9">
            <div class="content" v-show="!item.isEdit">{{ item.content }}</div>
            <Input
              ref="updateInputList"
              v-show="item.isEdit"
              v-model.trim="item.updateValue"
            />
          </Col>
          <Col span="3" offset="1">
            <input
              @change="onUpdateColor(item, $event)"
              style="height:32px;cursor:pointer;"
              type="color"
              :value="item.color"
            />
          </Col>
          <Col class="option" span="8" offset="1">
            <Button
              class="btn"
              v-show="!item.isEdit"
              @click="onToggleEdit(item, true, index)"
              shape="circle"
              icon="md-create"
            ></Button>
            <Button
              v-show="!item.isEdit"
              @click="onConfirmDelete(item)"
              class="btn"
              shape="circle"
              icon="md-remove"
            ></Button>
            <Button
              class="btn"
              v-show="item.isEdit"
              shape="circle"
              @click="onUpdate(item)"
              icon="md-checkmark"
            ></Button>
            <Button
              class="btn"
              v-show="item.isEdit"
              shape="circle"
              @click="onToggleEdit(item, false, index)"
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
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      tagName: "",
      requestPrefix: "/notepad/tag"
    };
  },
  methods: {
    async onUpdateColor(argItem, $event) {
      argItem.color = $event.currentTarget.value;
      let response = await this.requestUpdateColor(argItem);
      this.$Message.success("修改成功");
    },
    requestUpdateColor(argItem) {
      this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/updateColor",
        data: {
          id: argItem.id,
          color: argItem.color
        }
      });
    },
    async onAdd(argContent) {
      if (argContent.length > 0) {
        let response = await this.requestAdd(argContent);
        if (response.data.isFailed) {
          // 当新增标签与已有标签重名时
          this.$Message.warning(response.data.message);
        } else {
          this.tagName = "";
          this.onGet();
        }
      }
    },
    requestAdd(argContent) {
      //提交新增标签

      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/add",
        data: {
          content: argContent,
          color: "#" + ((Math.random() * 16777215) | 0).toString(16)
        }
      });
    },
    onConfirmDelete(argItem) {
      //提交删除标签
      this.$Modal.confirm({
        title: "删除标签",
        content: "所有绑定了该标签的记事都会移除该标签,这个操作不可逆！",
        onOk: () => {
          this.onDelete(argItem);
        }
      });
    },
    async onDelete(argItem) {
      let response = await this.requestDelete(argItem);
      this.onGet();
      this.$emit("on-delete-callback", argItem.id);
    },
    requestDelete(argItem) {
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/delete",
        data: {
          id: argItem.id
        }
      });
    },

    async onUpdate(argItem) {
      if (
        argItem.updateValue.length &&
        argItem.updateValue !== argItem.content
      ) {
        let response = await this.requestUpdate(argItem);
        if (response.data.isFailed) {
          //当新命名的标签与已有标签重名时
          this.$Message.warning(response.data.message);
        } else {
          argItem.isEdit = false;
          argItem.content = argItem.updateValue;
        }
      }
    },
    requestUpdate(argItem) {
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/update",
        data: {
          content: argItem.updateValue,
          id: argItem.id
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
    async onGet() {
      let response = await this.requestGet();
      let isHave = window.localStorage.filterTagId ? false : true;
      let list = response.data.map((el, index, arr) => {
        if (el.content == window.localStorage.filterTagId) {
          isHave = true;
        }
        el.updateValue = el.content;
        el.isEdit = false;
        return el;
      });
      if (!isHave) {
        if (
          window.confirm(
            "切换分支导致标签数据异常,点击确定将重置localStorage里的filterTagId!"
          )
        ) {
          window.localStorage.filterTagId = "";
          window.location.reload();
        }
      }
      this.$emit("change", list);
    },
    requestGet() {
      //提交获取标签
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/get"
      });
    }
  },
  computed: {},
  mounted() {
    this.onGet();
  }
};
</script>
