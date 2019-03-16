<style lang="less">
@import "~@/assets/style/base.less";

#notepad-id {
  //增大上面的空间 为了使过滤标签的下拉弹框能在上面弹出
  padding-top: 45px;
  font-size: 14px;

  > .app-name {
    margin: 1em auto;

    text-align: center;
  }

  .first-btn {
    margin-right: 15px;
    margin-bottom: 20px;
  }

  .add-btn {
    font-size: 40px;

    display: block;

    width: 100px;
    height: 100px;
    margin: 10px auto;
  }

  > .wrapper {
    width: 85%;
    max-width: 650px;
    margin: 0 auto;
  }

  .no-data {
    line-height: 40px;

    text-align: center;
  }
  .filter-select {
    //解决出现、消失滚动条时  下拉选框错位的问题
    position: relative;
    .ivu-select-dropdown {
      //如果想让下拉选框弹出的位置在上面，则上面的空间-头部的空间需要大于165
      max-height: 165px;
    }
  }
  .card {
    margin-top: 10px;

    .inner-shadow {
      display: none;
    }
  }

  .show-area {
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>
<template>
  <div id="notepad-id">
    <!-- <h1 style="height:10px">h1</h1> -->
    <div class="wrapper">
      <div class="card-wrapper" v-show="showModelFlag === 'notepad'">
        <Button icon="ios-pricetag" class="first-btn" @click="showModelFlag = 'tag'">标签管理</Button>
        <Button icon="ios-folder" class="first-btn" @click="showModelFlag = 'file'">文件管理</Button>
        <Button @click="onAdd()" type="primary" long>
          <span>添加</span>
        </Button>
        <Select
          class="filter-select"
          placement="top"
          @on-change="onChangeFilterTag()"
          style="margin-top:10px;"
          v-model="filterTagId"
          placeholder="标签过滤"
        >
          <Option :key="item.id" v-for="item in tagList" :value="item.id">{{item.content}}</Option>
        </Select>
        <!-- 记事的展示 -->
        <div v-if="list && list.length > 0">
          <div
            v-for="(item,index) in list"
            :key="item.id"
            @mouseover="item.isMouseOver=true"
            @mouseout="item.isMouseOver=false"
          >
            <Card
              class="card"
              :bordered="false"
              :style="item.isMouseOver && {boxShadow:`0 1px ${item.shadowBlur}px ${item.shadowSpread}px rgba(0,0,0,${item.shadowAlpha})`}"
            >
              <p slot="title">
                <Icon type="md-book"></Icon>
                {{item.title}}
              </p>
              <div slot="extra">
                <Button type="text" @click="onRequestTop(item)">置顶</Button>
                <Icon
                  type="ios-open-outline"
                  @click.stop="onEdit(item,index)"
                  style="margin-right:10px;cursor:pointer;"
                ></Icon>
                <Button @click.stop="onConfirmDelete(item,index)" style="color: red;">删除</Button>
              </div>
              <div>
                <div style="color: #bab9b9;">
                  <span>创建日期</span>
                  :{{item.createTime}}
                  <span style="margin-left: 30px;">修改日期</span>
                  :{{item.updateTime}}
                </div>
                <div></div>

                <div class="show-area" v-html="convertHtml(item.content)"></div>
              </div>
            </Card>
          </div>
          <Page
            :current="pagination.page"
            @on-change="onChangePage"
            style="margin-top: 20px;margin-bottom:20px;float: right;"
            :total="pagination.total"
            :page-size="pagination.size"
            show-total
            simple
          />
        </div>
        <div class="no-data" v-if="list && list.length === 0">暂无数据</div>
      </div>
      <!-- 标签管理 -->
      <TagManagerComponent
        v-show="showModelFlag === 'tag'"
        @on-back="()=>this.showModelFlag = 'notepad'"
        v-model="tagList"
      ></TagManagerComponent>
      <FileManagerComponent
        @on-back="()=>this.showModelFlag = 'notepad'"
        v-show="showModelFlag === 'file'"
        v-model="fileUploadList"
      ></FileManagerComponent>
      <!-- 文件管理 -->
      <!-- v-if="showModelFlag === 'file'" class="file-wrapper" -->
    </div>
    <!-- 修改记事 -->
    <Modal v-model="isVisible" :mask-closable="false" @on-visible-change="onChangeVisible">
      <p slot="header"></p>
      <div>
        <Input
          ref="autoFocusInput"
          @on-keyup.ctrl.enter="onCloseEditModel(activNotepad,activeIndex)"
          :clearable="true"
          :rows="10"
          placeholder="输入内容"
          v-model="activNotepad.content"
          type="textarea"
        />

        <br>
        <br>
        <Select v-model="activNotepad.tagId">
          <Option :key="item.id" v-for="item in tagList" :value="item.id">{{item.content}}</Option>
        </Select>
        <br>
        <br>
        <Input :clearable="true" placeholder="输入标题" v-model="activNotepad.title"/>
      </div>
      <div slot="footer">
        <Button @click="onCloseEditModel(activNotepad,activeIndex)" type="primary">确定</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
import DateHelper from "@/assets/lib/DateHelper";
import TagManagerComponent from "./tag_manager";
import FileManagerComponent from "./file_manager";
export default {
  name: "",
  data() {
    return {
      isVisible: false,
      showModelFlag: "notepad", // tag 、 file
      fileUploadList: [],
      tagList: [],

      requestPrefix: "/notepad/notepad", //记事 请求前缀
      isShowAddModel: false,
      isShowEditModel: false,
      isShowDeleteModel: false,

      //当前活动的记事的索引
      activeIndex: "",
      pagination: {
        //记事 的分页器
        page: 1,
        size: 3
      },
      list: null,
      activNotepad: {},
      activeIndex: 0,
      filterTagId: [] //用于过滤的标签id
    };
  },
  components: {
    TagManagerComponent,
    FileManagerComponent
  },
  filters: {},
  computed: {},
  methods: {
    onAdd() {
      this.activNotepad = {};
      this.isShowAddModel = true;
      this.isVisible = true;
    },
    onEdit(argNotepad, argIndex) {
      this.activNotepad = { ...argNotepad };
      this.isShowEditModel = true;
      this.activeIndex = argIndex;
      this.isVisible = true;
    },
    convertHtml(argContent = "") {
      // 将内容中的连接 替换成标签

      let pattern = /(http|https):\/\/[\S]+/g;
      let result = argContent;

      result = result.replace(pattern, (all, group, index) => {
        return `<a target="_black" href="${all}">${all}</a>`;
      });

      return result;
    },

    onRequestTop(argItem) {
      this.$axios
        .request({
          method: "post",
          url: this.requestPrefix + "/top",
          data: {
            id: argItem.id
          }
        })
        .then(response => {
          this.requestGet(this.pagination, {
            tagId: this.filterTagId
          });
          this.$Message.success("置顶成功");
        });
    },

    onChangeFilterTag() {
      //过滤内容发生变化
      this.pagination.page = 1;
      this.requestGet(this.pagination, { tagId: this.filterTagId });
    },
    onChangePage(argPage) {
      //切换记事分页器
      this.pagination.page = argPage;
      this.requestGet(this.pagination, { tagId: this.filterTagId });
    },

    //  //同步数据  将记事里面的标签数据删除
    //   this.$axios
    //     .request({
    //       method: "post",
    //       url: this.requestPrefix + "/removeTag",
    //       data: {
    //         id: argItem.id
    //       }
    //     })
    //     .then(response => {
    //       this.request_get(this.pagination, {
    //         tagId: this.filterTagId
    //       });
    //     });

    onConfirmDelete(argNotepad, argIndex) {
      //确认是否删除记事
      this.$Modal.confirm({
        title: "删除",
        content: "确认删除这条记事嘛?",
        onOk: () => {
          this.$axios
            .request({
              method: "post",
              url: this.requestPrefix + "/del",
              data: {
                id: argNotepad.id
              }
            })
            .then(response => {
              //从前端这里虽然在当前页没有数据时候会多请求一次,但是,一切因该以后台数据为准
              //也是为了将逻辑内聚在request_get
              this.requestGet(this.pagination, {
                tagId: this.filterTagId
              });
            });
        }
      });
    },

    requestGet(argPagination, argFilter = {}) {
      //得到日记信息

      this.$axios
        .request({
          method: "post",
          url: this.requestPrefix + "/get",
          data: {
            page: argPagination.page,
            size: argPagination.size,
            filter: argFilter
          }
        })
        .then(response => {
          if (response.data.data.length === 0 && this.pagination.page > 1) {
            //获取的数据条数为0 且不是第一页  会根据后台返回的数据计算最大的一页进行请求
            let maxPage =
              ((response.data.total - 1) / this.pagination.size + 1) | 0;
            this.pagination.page = maxPage;
            this.requestGet(this.pagination, {
              tagId: this.filterTagId
            });
          } else {
            this.list = [];
            response.data.data.forEach(el => {
              let notepad = this.convert(el);
              this.list.push(notepad);
            });
          }

          this.pagination.total = response.data.total;
        });
    },
    convert(argNotepad) {
      //转换请求过来的日记数据
      let notepad = { ...argNotepad };
      let createTime = DateHelper.get_instance_timestamp(
        notepad.createTime
      ).get_format_date();
      notepad.createTime = createTime;
      //标题默认为创建日期
      if (!notepad.title) {
        notepad.title = createTime;
      }
      //属性提前声明
      notepad.isMouseOver = false;
      if (notepad.updateTime) {
        notepad.updateTime = DateHelper.get_instance_timestamp(
          notepad.updateTime
        ).get_format_date();
      }
      //根据创建时间域当前时间所差的天数   动态的改变鼠标悬浮的阴影
      Object.assign(notepad, {
        shadowBlur: 6,
        shadowAlpha: 0.2,
        shadowSpread: 0
      });
      let currentTimestamp = Date.now();
      let day =
        ((currentTimestamp - (argNotepad.updateTime || argNotepad.createTime)) /
          (24 * 60 * 60 * 1000)) |
        0;
      if (day > 0) {
        notepad.shadowBlur += 10 * day;
        notepad.shadowAlpha += 0.05 * day;
        notepad.shadowSpread += 5 * day;
      }
      return notepad;
    },
    onCloseEditModel(argNotepad, argIndex) {
      if (this.isShowAddModel) {
        this.requestAdd(argNotepad);
      } else if (this.isShowEditModel) {
        this.requestUpdate(argNotepad, argIndex);
      }
      this.isVisible = false;
      this.isShowAddModel = false;
      this.isShowEditModel = false;
    },
    requestAdd(argNotepad) {
      //提交添加记事
      this.filterTagId = "";
      this.$axios
        .request({
          method: "post",
          url: this.requestPrefix + "/add",
          data: argNotepad
        })
        .then(response => {
          this.pagination.page = 1;
          this.requestGet(this.pagination);
        });
    },
    requestUpdate(argNotepad, argIndex) {
      //提交更改记事
      this.$axios
        .request({
          method: "post",
          url: this.requestPrefix + "/update",
          data: argNotepad
        })
        .then(response => {
          let notepad = this.convert(response.data.data);
          this.list.splice(this.argIndex, 1, notepad);
        });
    },
    onChangeVisible() {
      //编辑、修改记事的时候  自动获得焦点
      this.$nextTick(() => {
        this.$refs.autoFocusInput.focus();
      });
    }
  },

  mounted() {
    this.requestGet(this.pagination);
  }
};
</script>

