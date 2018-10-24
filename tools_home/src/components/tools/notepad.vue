<template>
  <div id="notepad-id">
    <h1 class="app-name">记事本</h1>
    <div class="wrapper">

      <div class="card-wrapper" v-show="!tagModel.isShow">
        <Button class="first-btn" @click="inTagModel()">标签管理</Button>
        <Button @click="edit()" type="primary" long><span>添加</span></Button>
        <div v-if="list.length > 0">
          <Card class="card" :bordered="false" v-for="(item,index) in list" :key="item.id">
            <p slot="title">
              <Icon type="md-book"></Icon> {{item.title}}
            </p>
            <div slot="extra">
              <Icon type="ios-open-outline" @click.stop="edit(item,index)" style="margin-right:10px;cursor:pointer;"></Icon>
              <Button @click.stop="confirm_delete(item,index)" style="color: red;">删除</Button>
            </div>
            <div>
              <div style="color: #bab9b9;">

                <span>创建日期</span>:{{item.createTime}} <span style="margin-left: 30px;">修改日期</span>:{{item.updateTime}}
              </div>
              <div>

              </div>
              <Input autosize class="show-area" type="textarea" readonly style="border: none; margin-top: 5px;color: rgb(49,49,49)" v-model="item.content" />

            </div>
          </Card>
          <Page :current="pagination.page" @on-change="change_page" style="margin-top: 20px;margin-bottom:20px;float: right;" :total="pagination.total" :page-size="pagination.size" show-total simple />
        </div>
        <div class="no-data" v-else>
          赶快创建吧！
        </div>
      </div>
      <div class="tag-wrapper" v-show="tagModel.isShow">
        <Button class="first-btn" @click="tagModel.isShow = false">返回</Button>
        <div class="first">
          <Row>
            <Col span="18">
            <Input v-model="tagModel.content" />
            </Col>
            <Col span="1" offset="1">
            <Button @click="request_add_tag(tagModel.content)" type="primary">添加</Button>
            </Col>
          </Row>
          <div class="tag" :key="item.id" v-for="item in tagModel.list">
            <Row>
              <Col span="14">
              <Input v-model="item.content" :readonly="item.readonly" />
              </Col>
              <Col span="2" offset="1">
              <Button v-show="!item.isEdit" @click="item.isEdit = true" shape="circle" icon="md-create"></Button>
              <Button v-show="item.isEdit" shape="circle" icon="md-checkmark"></Button>
              </Col>
              <Col span="2">
              <Button v-show="!item.isEdit" shape="circle" icon="md-remove"></Button>
              <Button v-show="item.isEdit" @click="item.isEdit = false" shape="circle" icon="md-close"></Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    </div>
    <Modal v-model="editModel.isShow" :mask-closable='false' @on-visible-change="change_visible">
      <p slot="header"></p>
      <div>
        <Input ref="autoFocusInput" :clearable="true" :rows="10" placeholder="输入内容" v-model="notepad.content" type="textarea" />
        <br>
        <br>
        <Input :clearable="true" placeholder="输入标题" v-model="notepad.title" />
      </div>
      <div slot="footer">
        <Button @click="close_edit_model(notepad)" type="primary">确定</Button>
      </div>
    </Modal>
    <Modal v-model="deleteModel.isShow" @on-ok="request_del()">
      <div>确定删除?</div>
    </Modal>

  </div>
</template>
<script>
import DateHelper from "@/assets/lib/DateHelper";
import AxiosHelper from "@/assets/lib/AxiosHelper";
export default {
  name: "",
  data() {
    return {
      tagModel: {
        isShow: false,
        list: []
      },
      requestPrefix: "/notepad/notepad",
      requestPrefixTag: "/notepad/tag",
      editModel: {
        isShow: false
      },
      deleteModel: {
        isShow: false
      },
      active: {
        //当前活动的日记
        index: ""
      },
      pagination: {
        page: 1,
        size: 3
      },
      list: [
        //存储所有的日记
      ],
      notepad: {
        //日记的基本结构 用于日记的添加和修改
        title: "",
        content: ""
      }
    };
  },
  computed: {},
  methods: {
    change_page(argPage) {
      this.pagination.page = argPage;
      this.request_get(this.pagination);
    },
    inTagModel() {
      this.tagModel.isShow = true;
      this.request_get_tag();
    },
    confirm_delete(argNotepad, index) {
      this.active.notepad = argNotepad;
      this.active.index = index;
      this.deleteModel.isShow = true;
    },
    request_add_tag(argContent) {
      AxiosHelper.request({
        method: "post",
        url: this.requestPrefixTag + "/add",
        data: {
          content: argContent
        }
      }).then(response => {
        this.request_get_tag();
      });
    },
    request_get_tag() {
      AxiosHelper.request({
        method: "post",
        url: this.requestPrefixTag + "/get"
      }).then(response => {
        this.tagModel.list = response.data.map((el, index, arr) => {
          el.readonly = true;
          el.isEdit = false;
          return el;
        });
      });
    },
    request_get(argPagination) {
      //得到日记信息
      AxiosHelper.request({
        method: "post",
        url: this.requestPrefix + "/get",
        data: {
          page: argPagination.page,
          size: argPagination.size
        }
      }).then(response => {
        if (response.data.data.length === 0 && this.pagination.page > 1) {
          let maxPage =
            ((response.data.total - 1) / this.pagination.size + 1) | 0;
          this.pagination.page = maxPage;
          this.request_get(this.pagination);
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
      let createTime = DateHelper.getDateFormatString(
        "YYYY-MM-dd",
        false,
        new Date(notepad.createTime)
      );
      notepad.createTime = createTime;
      if (notepad.title === "") {
        notepad.title = createTime;
      }
      if (notepad.updateTime !== "") {
        notepad.updateTime = DateHelper.getDateFormatString(
          "YYYY-MM-dd",
          false,
          new Date(notepad.updateTime)
        );
      }
      return notepad;
    },
    request_add(argNotepad) {
      AxiosHelper.request({
        method: "post",
        url: this.requestPrefix + "/add",
        data: argNotepad
      }).then(response => {
        this.pagination.page = 1;
        this.request_get(this.pagination);
      });
    },
    request_update(argNotepad) {
      AxiosHelper.request({
        method: "post",
        url: this.requestPrefix + "/update",
        data: argNotepad
      }).then(response => {
        let notepad = this.convert(response.data.data);
        this.list.splice(this.active.index, 1, notepad);
      });
    },
    change_visible() {
      this.$nextTick(() => {
        this.$refs.autoFocusInput.focus();
      });
    },
    edit(argNotepad = { title: "", content: "" }, argIndex) {
      //编辑日记
      this.editModel.isShow = true;
      this.notepad = { ...argNotepad };
      this.active.index = argIndex;
    },
    request_del() {
      AxiosHelper.request({
        method: "post",
        url: this.requestPrefix + "/del",
        data: {
          id: this.active.notepad.id
        }
      }).then(response => {
        //从前端这里虽然在当前页没有数据时候会多请求一次,但是,一切因该以后台数据为准
        this.request_get(this.pagination);
      });
    },

    close_edit_model(argNotepad) {
      this.editModel.isShow = false;
      if (argNotepad.id === undefined) {
        //创建
        this.request_add(argNotepad);
      } else {
        //修改
        this.request_update(argNotepad);
      }
    }
  },
  created() {
    this.request_get(this.pagination);
  }
};
</script>
<style lang="less">
@import '~@/assets/style/base.less';

#notepad-id {
  font-size: 14px;

   > .app-name {
    margin: 1em auto;text-align: center;
  }

  .first-btn {
    margin-bottom: 20px;
  }

  .add-btn {
    font-size: 40px;display: block;width: 100px;height: 100px;margin: 10px auto;
  }

   > .wrapper {
    width: 85%;max-width: 650px;margin: 0 auto;
  }

  .no-data {
    line-height: 40px;text-align: center;
  }

  .card {
    margin-top: 10px;
  }

  .show-area .ivu-input {
    height: auto;resize: none;border: none;
  }

  .tag-wrapper {
    .tag {
      margin-top: 15px;
    }
  }
}

</style>
