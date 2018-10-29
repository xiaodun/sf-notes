<style lang="less">
@import '~@/assets/style/base.less';

#notepad-id {
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

  .card {
    margin-top: 10px;
  }

  .show-area .ivu-input {
    height: auto;

    resize: none;

    border: none;
  }

  .tag-wrapper {
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

        height: 32px;

        border-bottom: 1px solid #ccc;
      }

      .option {
        display: none;
      }
    }
  }

  .upload-wrapper {
    margin-top: 15px;

    .file {
      margin: 15px 0;

      &:hover {
        .option {
          display: block;
        }
      }
    }

    .name {
      border-bottom: 1px solid #ccc;

.vertical_lineheight(32px);
    }

    .option {
      display: none;
    }
  }
}

</style>
<template>
  <div id="notepad-id">
    <h1 class="app-name">记事本</h1>
    <div class="wrapper">

      <div class="card-wrapper" v-show="showModelFlag === 'notepad'">
        <Button icon="ios-pricetag" class="first-btn" @click="inTagModel()">标签管理</Button>
        <Button icon="ios-folder"  class="first-btn" @click="inFileModel()">文件管理</Button>
        <Button @click="edit()" type="primary" long><span>添加</span></Button>
        <Select :transfer="true" placement="top" @on-change="change_filter_tag()" style="margin-top:10px;" v-model="filterTagIdList" multiple placeholder="标签过滤">
          <Option :key="item.id" v-for="item in tagModel.list" :value="item.id">{{item.content}}</Option>
        </Select>
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
          暂无数据
        </div>
      </div>
      <div class="tag-wrapper" v-show="showModelFlag === 'tag'">
        <Button class="first-btn" @click="showModelFlag = 'notepad'">返回</Button>
        <div class="first">
          <Row>
            <Col span="18">
            <Input v-model="tagModel.content" @on-keyup.enter="request_add_tag(tagModel.content)" />
            </Col>
            <Col span="1" offset="1">
            <Button @click="request_add_tag(tagModel.content)" type="primary">添加</Button>
            </Col>
          </Row>
          <div class="tag" :class="{'in-edit':item.isEdit}" :key="item.id" v-for="item in tagModel.list">
            <Row>
              <Col span="14">
              <div class="content" v-show="!item.isEdit">{{item.content}}</div>
              <Input v-show="item.isEdit" v-model="item.content" />
              </Col>
              <Col class="option" span="2" offset="1">
              <Button v-show="!item.isEdit" @click="inUpdateTag(item)" shape="circle" icon="md-create"></Button>
              <Button v-show="item.isEdit" shape="circle" @click="reques_update_tag(item)" icon="md-checkmark"></Button>
              </Col>
              <Col class="option" span="2">
              <Button v-show="!item.isEdit" @click="confirm_delete_tag(item)" shape="circle" icon="md-remove"></Button>
              <Button v-show="item.isEdit" @click="abortUpdateTag(item)" shape="circle" icon="md-close"></Button>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      <div v-show="showModelFlag === 'file'" class="file-wrapper">
        <Button class="first-btn" @click="outFileModel()">返回</Button>
        <Upload :before-upload="before_upload" :on-success="request_get_file" ref="upload" :show-upload-list="false" :paste="true" :action="BuiltServiceConfig.prefix + requestPrefixFile + '/upload'" type="drag" multiple>
          <div style="height:200px;line-height:200px;">点击或拖拽上传</div>
        </Upload>

        <div class="upload-wrapper">
          <div class="file" :key="index" v-for="(item,index) in fileModel.uploadList">
            <Row>
              <Col span="14">
              <div class="name">{{item.name}}</div>
              </Col>
              <Col class="option" span="2" offset="1">
              <Button shape="circle" icon="md-download" @click="request_download_file(item)"></Button>
              </Col>
              <Col class="option" span="2">
              <Button shape="circle" icon="md-remove" @click="request_delete_file(item)"></Button>
              </Col>
            </Row>
          </div>

        </div>

      </div>
    </div>

    <Modal v-model="editModel.isShow" :mask-closable='false' @on-visible-change="change_visible">
      <p slot="header"></p>
      <div>
        <Input ref="autoFocusInput" @on-keyup.ctrl.enter="close_edit_model(notepad)" :clearable="true" :rows="10" placeholder="输入内容" v-model="notepad.content" type="textarea" />
        <br>
        <br>
        <Select v-model="notepad.tagIdList" multiple>
          <Option :key="item.id" v-for="item in tagModel.list" :value="item.id">{{item.content}}</Option>
        </Select>
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
import BuiltServiceConfig from '@root/service/app/config.json';
import DateHelper from '@/assets/lib/DateHelper';
import AxiosHelper from '@/assets/lib/AxiosHelper';
export default {
  name: '',
  data() {
    return {
      showModelFlag: 'notepad', // tag file
      fileModel: {
        uploadList: [],
      },
      tagModel: {
        list: [],
      },
      BuiltServiceConfig,
      requestPrefix: '/notepad/notepad',
      requestPrefixTag: '/notepad/tag',
      requestPrefixFile: '/notepad/upload',
      editModel: {
        isShow: false,
      },
      deleteModel: {
        isShow: false,
      },
      active: {
        //当前活动的日记
        index: '',
      },
      pagination: {
        page: 1,
        size: 3,
      },
      list: [
        //存储所有的日记
      ],
      filterTagIdList: [], //用于过滤的标签id
      notepad: {
        //日记的基本结构 用于日记的添加和修改
        title: '',
        content: '',
      },
    };
  },
  computed: {},
  methods: {
    before_upload(file) {
      let index = file.name.lastIndexOf('.');
      if (~index) {
        let stuffix = file.name.substr(index);
        if (~stuffix.indexOf('exe')) {
          this.$Message.warning({
            content: 'exe文件需要添加到压缩文件才能上传!',
            duration: 5,
          });
          return false;
        }
      }
      return true;
    },
    request_download_file(item) {
      AxiosHelper.request({
        method: 'get',
        url: this.requestPrefixFile + '/download' + `?id=${item.id}`,
        responseType: 'blob',
      }).then(response => {
        var blob = response.data;
        var reader = new FileReader();

        reader.readAsDataURL(blob);
        reader.onload = function(e) {
          var a = document.createElement('a');
          a.download = item.name;
          a.href = e.target.result;
          document.body.appendChild(a);
          a.click();
          a.remove();
        };
      });
    },
    change_filter_tag() {
      this.pagination.page = 1;
      this.request_get(this.pagination, {tagIdList: this.filterTagIdList});
    },
    change_page(argPage) {
      this.pagination.page = argPage;
      this.request_get(this.pagination, {tagIdList: this.filterTagIdList});
    },
    confirm_delete_tag(item) {
      this.$Modal.confirm({
        title: '删除标签',
        content: '所有绑定了该标签的记事都会移除该标签,这个操作不可逆！',
        onOk: this.rquest_delete_tag.bind(this, item),
      });
    },
    rquest_delete_tag(item) {
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefixTag + '/delete',
        data: {
          id: item.id,
        },
      }).then(response => {
        this.request_get_tag();
      });
      //同步数据  将记事里面的标签数据删除
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefix + '/removeTag',
        data: {
          id: item.id,
        },
      }).then(response => {
        this.request_get(this.pagination, {tagIdList: this.filterTagIdList});
      });
    },
    inTagModel() {
      this.showModelFlag = 'tag';
    },
    inFileModel() {
      this.showModelFlag = 'file';
      this.request_get_file();
    },
    outFileModel() {
      this.showModelFlag = 'notepad';
    },
    confirm_delete(argNotepad, index) {
      this.active.notepad = argNotepad;
      this.active.index = index;
      this.deleteModel.isShow = true;
    },
    inUpdateTag(item) {
      item.isEdit = true;
    },
    abortUpdateTag(item) {
      item.isEdit = false;
      item.content = item.originContent;
    },
    reques_update_tag(item) {
      item.content &&
        item.content.trim() !== item.originContent.trim() &&
        AxiosHelper.request({
          method: 'post',
          url: this.requestPrefixTag + '/update',
          data: {
            content: item.content,
            id: item.id,
          },
        }).then(response => {
          if (response.data.isFailed) {
            this.$Message.warning(response.data.message);
          } else {
            item.isEdit = false;
          }
        });
    },
    request_add_tag(argContent) {
      argContent &&
        AxiosHelper.request({
          method: 'post',
          url: this.requestPrefixTag + '/add',
          data: {
            content: argContent,
          },
        }).then(response => {
          if (response.data.isFailed) {
            this.$Message.warning(response.data.message);
          } else {
            this.tagModel.content = '';
            this.request_get_tag();
          }
        });
    },
    request_delete_file(item) {
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefixFile + '/delete',
        data: {
          id: item.id,
        },
      }).then(response => {
        this.$Message.success('已删除!');

        this.request_get_file();
      });
    },
    request_get_tag() {
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefixTag + '/get',
      }).then(response => {
        this.tagModel.list = response.data.map((el, index, arr) => {
          el.originContent = el.content;
          el.isEdit = false;
          return el;
        });
      });
    },
    request_get_file() {
      AxiosHelper.request({
        method: 'get',
        url: this.requestPrefixFile + '/get',
      }).then(response => {
        this.fileModel.uploadList = response.data;
      });
    },
    request_get(argPagination, argFilter = {}) {
      //得到日记信息
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefix + '/get',
        data: {
          page: argPagination.page,
          size: argPagination.size,
          filter: argFilter,
        },
      }).then(response => {
        if (response.data.data.length === 0 && this.pagination.page > 1) {
          let maxPage =
            ((response.data.total - 1) / this.pagination.size + 1) | 0;
          this.pagination.page = maxPage;
          this.request_get(this.pagination, {
            tagIdList: this.filterTagIdList,
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
      let notepad = {...argNotepad};
      let createTime = DateHelper.getDateFormatString(
        'YYYY-MM-dd',
        false,
        new Date(notepad.createTime)
      );
      notepad.createTime = createTime;
      if (notepad.title === '') {
        notepad.title = createTime;
      }
      if (notepad.updateTime !== '') {
        notepad.updateTime = DateHelper.getDateFormatString(
          'YYYY-MM-dd',
          false,
          new Date(notepad.updateTime)
        );
      }
      return notepad;
    },
    request_add(argNotepad) {
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefix + '/add',
        data: argNotepad,
      }).then(response => {
        this.pagination.page = 1;
        this.request_get(this.pagination);
      });
    },
    request_update(argNotepad) {
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefix + '/update',
        data: argNotepad,
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
    edit(argNotepad = {title: '', content: '', tagIdList: []}, argIndex) {
      //编辑日记
      this.editModel.isShow = true;
      this.notepad = {...argNotepad};
      this.active.index = argIndex;
    },
    request_del() {
      AxiosHelper.request({
        method: 'post',
        url: this.requestPrefix + '/del',
        data: {
          id: this.active.notepad.id,
        },
      }).then(response => {
        //从前端这里虽然在当前页没有数据时候会多请求一次,但是,一切因该以后台数据为准
        this.request_get(this.pagination, {tagIdList: this.filterTagIdList});
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
    },
  },
  created() {
    this.request_get(this.pagination);
    this.request_get_tag();
  },
};
</script>

