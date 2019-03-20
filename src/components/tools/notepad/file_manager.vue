<style lang="less">
@import "~@/assets/style/base.less";

#file_manager-vue-id {
  .uploading-enter-active,
  .uploading-leave-active {
    transition: all 0.5s;
  }

  .uploading-enter,
  .uploading-leave-to {
    transform: translateY(30px);

    opacity: 0;
  }
  .fileinfo {
    margin: 20px;

    color: #808080;
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
      overflow: hidden;

      white-space: nowrap;
      text-overflow: ellipsis;

      border-bottom: 1px solid #ccc;

      .vertical_lineheight(32px);
    }

    .option {
      display: none;
      @media screen and (max-width: 779px) {
        display: block;
      }
    }
  }
}
</style>
<template>
  <div id="file_manager-vue-id">
    <Button class="first-btn" @click="$emit('on-back')">返回</Button>
    <Upload
      :on-progress="onUploadProgress"
      :on-error="onUploadError"
      :on-success="onGet"
      ref="upload"
      :show-upload-list="false"
      :paste="true"
      :action="BuiltServiceConfig.prefix + requestPrefix + '/upload'"
      type="drag"
      multiple
    >
      <div style="height:200px;line-height:200px;">点击或拖拽上传</div>
    </Upload>
    <!-- 上传 -->
    <div class="upload-wrapper">
      <!-- 正在上传的文件 -->
      <transition-group tag="div" name="uploading">
        <div class="uploading" :key="index" v-for="(item,index) in uploadingList">
          <div>{{item.name}}</div>
          <Progress :percent="item.percent"/>
        </div>
      </transition-group>
      <!-- 已经上传完毕 -->
      <div class="file" :key="index" v-for="(item,index) in uploadList">
        <Row>
          <Col span="12">
            <div class="name">{{item.name}}</div>
          </Col>
          <Col class="option" span="10" offset="1">
            <Button
              icon="md-download"
              :loading="item.isDownloading"
              style="margin-right:10px"
              shape="circle"
              @click="onDownload(item)"
            ></Button>
            <Button
              shape="circle"
              icon="md-remove"
              style="margin-right:10px"
              @click="onConfirmDelete(item)"
            ></Button>
            <Button shape="circle" icon="md-information" @click="inUpdateModal(item)"></Button>
          </Col>
          <Col span="14" v-if="item.describe">
            <div class="fileinfo">{{item.describe}}</div>
          </Col>
        </Row>
      </div>
    </div>
    <Modal title="修改描述" v-model="isShowUpdate" @on-ok="onUpdate(activeFile)">
      <div>
        <Input
          ref="updateDom"
          @on-keyup.ctrl.enter="onRequestUpdate(activeFile)"
          type="textarea"
          v-model="activeFile.describe"
        />
      </div>
    </Modal>
  </div>
</template>
<script>
//内置服务器配置
import BuiltServiceConfig from "@root/service/app/config.json";
export default {
  name: "file_manager_vue",
  model: {
    prop: "uploadList",
    event: "change"
  },
  props: {
    uploadList: {
      type: Array,
      default: []
    }
  },
  data() {
    return {
      lastFile: null,
      activeFile: {},
      BuiltServiceConfig,
      requestPrefix: "/notepad/upload", //上传文件请求前缀
      uploadingList: [], //正在上传的文件
      isShowUpdate: false
    };
  },
  methods: {
    async onUpdate(argItem) {
      let response = await this.requestUpdate(argItem);
      this.$Message.success("修改成功");
      this.isShowUpdate = false;
      this.lastFile.describe = argItem.describe;
    },
    requestUpdate(argItem) {
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/update",
        data: {
          id: argItem.id,
          describe: argItem.describe
        }
      });
    },
    inUpdateModal(argItem) {
      this.lastFile = argItem;
      this.activeFile = { ...argItem };
      this.isShowUpdate = true;
      this.$nextTick(() => {
        this.$refs.updateDom.focus();
      });
    },
    onUploadProgress(argEvent, argFile) {
      let index = this.uploadingList.findIndex(el => el.file === argFile);

      if (index === -1) {
        let uploadingFile = {};
        uploadingFile.name = argFile.name;
        uploadingFile.percent = argEvent.percent | 0;
        uploadingFile.file = argFile;
        this.uploadingList.push(uploadingFile);
      } else {
        this.uploadingList[index].percent = argEvent.percent | 0;
      }
      if (argEvent.percent === 100) {
        this.uploadingList.splice(index, 1);
      }
    },
    onUploadError(error, file, filelist) {
      this.$Message.error("上传失败!");
    },
    async onDownload(argItem) {
      argItem.isDownloading = true;
      let response = await this.requestDownload(argItem);
      var blob = response.data;
      var a = document.createElement("a");
      a.download = argItem.name;
      a.href = URL.createObjectURL(blob);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);
      argItem.isDownloading = false;
    },
    requestDownload(argItem) {
      //提交下载文件
      return this.$axios.request({
        method: "get",
        url: this.requestPrefix + "/download" + `?id=${argItem.id}`,
        responseType: "blob"
      });
    },
    onConfirmDelete(argItem) {
      this.$Modal.confirm({
        title: "文件删除",
        content: "删除文件后,无法通过界面操作恢复!",
        onOk: () => {
          this.onDelete(argItem);
        }
      });
    },
    async onDelete(argItem) {
      let response = await this.requestDelete(argItem);
      this.$Message.success("已删除!");

      this.onGet();
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
    async onGet() {
      let response = await this.requestGet();
      response.data.forEach((el, index, arr) => {
        el.describe = el.describe || "";
        el.isDownloading = false;
      });
      this.$emit("change", response.data);
    },
    requestGet() {
      //获取文件
      return this.$axios.request({
        method: "get",
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