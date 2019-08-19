<style lang="less">
@import "~@/assets/style/base.less";

#file_manager-vue-id {
  .uploading-enter-active,
  .uploading-leave-active {
    transition: all .5s;
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

.preview-modal-9b45763 {
  .ivu-modal {
    width: 85% !important;
    max-width: 560px !important;
  }

  .name {
    overflow: hidden;

    text-overflow: ellipsis;
    word-wrap: nowrap;
  }

  .row {
    font-size: 14px;

    margin-bottom: 10px;

    .label {
      font-weight: bold;
      line-height: 32px;

      overflow: hidden;

      height: 32px;

      white-space: nowrap;
      text-overflow: ellipsis;

      color: #333;
    }
  }

  .no-preview {
    padding: 40px;

    text-align: center;
  }

  .txt {
    font-size: 14px;

    overflow: auto;

    height: 500px;

    white-space: pre;
  }

  .img {
    img {
      max-width: 100%;
    }
  }

  .video {
    video {
      display: block;

      width: 100%;
    }
  }

  .audio {
    audio {
      display: block;

      width: 100%;

      &:focus {
        outline: 0;
      }
    }
  }
}

</style>
<template>
  <div id="file_manager-vue-id">
    <Button
      class="first-btn"
      @click="$emit('on-back')"
    >返回</Button>
    <Alert v-if="$browserMessage.isWeChat">微信内置浏览器不支持下载!</Alert>
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
      <transition-group
        tag="div"
        name="uploading"
      >
        <div
          class="uploading"
          :key="index"
          v-for="(item,index) in uploadingList"
        >
          <div>{{item.name}}</div>
          <Progress :percent="item.percent" />
        </div>
      </transition-group>
      <!-- 已经上传完毕 -->
      <div
        class="file"
        :key="index"
        v-for="(item,index) in uploadList"
      >
        <Row>
          <Col span="10">
          <div class="name">{{item.name}}</div>
          </Col>
          <Col
            class="option"
            span="12"
            offset="1"
          >
          <Button
            v-if="!$browserMessage.isWeChat"
            icon="md-download"
            :loading="item.isDownloading"
            style="margin-right:10px"
            title="下载"
            shape="circle"
            @click="onDownload(item)"
          ></Button>
          <Button
            shape="circle"
            icon="md-remove"
            title="删除"
            style="margin-right:10px"
            @click="onConfirmDelete(item)"
          ></Button>

          <Button
            shape="circle"
            title="备注"
            icon="md-information"
            style="margin-right:10px"
            @click="inUpdateModal(item)"
          ></Button>
          <Button
            shape="circle"
            icon="md-eye"
            title="预览"
            @click="onPreviewFile(item)"
          ></Button>
          </Col>
          <Col
            span="14"
            v-if="item.describe"
          >
          <div class="fileinfo">{{item.describe}}</div>
          </Col>
          <Col
            span="14"
            v-if="item.describe"
          >
          <div class="fileinfo">{{item.describe}}</div>
          </Col>
        </Row>
      </div>
    </div>
    <Modal
      title="修改描述"
      :mask-closable="false"
      v-model="isShowUpdate"
      @on-ok="onUpdate(activeFile)"
    >
      <div>
        <Input
          ref="updateDom"
          @on-keyup.ctrl.enter="onRequestUpdate(activeFile)"
          type="textarea"
          v-model="activeFile.describe"
        />
      </div>
    </Modal>
    <Modal
      title="预览文件"
      v-model="isPreviewFile"
      footer-hide
      :mask-closable="false"
      class="preview-modal-9b45763"
      @on-cancel="onClosePreviewFileModal"
    >
      <div class="container">
        <Row class="row">
          <Col
            span="4"
            class="label"
          >名称:</Col>
          <Col span="20">
          <div class="name">{{activePreview.name}}</div>
          </Col>
        </Row>
        <Row class="row">
          <Col
            span="4"
            class="label"
          >类型:</Col>
          <Col span="20">
          <RadioGroup
            v-model="activePreview.type"
            @on-change="onChangFileType()"
          >
            <Radio
              :disabled="computedDisabledFileRadio"
              :label="FileType.txt"
            >文本</Radio>
            <Radio
              :disabled="computedDisabledFileRadio"
              :label="FileType.img"
            >图片</Radio>
            <Radio
              :disabled="computedDisabledFileRadio"
              :label="FileType.audio"
            > 音频</Radio>
            <Radio
              :disabled="computedDisabledFileRadio"
              :label="FileType.video"
            >视频</Radio>
          </RadioGroup>
          </Col>
        </Row>
        <Row class="row">
          <Col
            span="4"
            class="label"
          >编码:</Col>
          <Col span="10">
          <Input
            v-model="defaultEncode"
            @on-keyup.enter="onParseFile(FileType.txt)"
          ></Input>
          </Col>
          <Col
            offset="1"
            span="4"
          >
          <Button @click="onParseFile(FileType.txt)">解析</Button>
          </Col>
        </Row>
        <Row>
          <div v-if="activePreview.isLoading">
            解析中...
          </div>
          <div v-else>

            <div v-if="activePreview.type">
              <div
                class="txt"
                v-if="activePreview.type === FileType.txt"
              >
                {{activePreview.txtContent}}
              </div>
              <div
                class="img"
                v-if="activePreview.type === FileType.img"
              >
                <img :src="activePreview.imgSrc">
              </div>
              <div
                class="audio"
                v-if="activePreview.type === FileType.audio"
              >
                <audio
                  controls
                  :src="activePreview.audioSrc"
                ></audio>
              </div>
              <div
                class="video"
                v-if="activePreview.type === FileType.video"
              >
                <video
                  controls
                  :src="activePreview.videoSrc"
                ></video>
              </div>
            </div>
            <div
              v-else
              class="no-preview"
            >
              该文件不在内置的可预览的文件类型中!可自行尝试!
            </div>
          </div>
        </Row>
      </div>
    </Modal>
  </div>
</template>
<script>
//内置服务器配置
let fileToBlob = {
  //缓存文件数据
};
import BuiltServiceConfig from "@root/service/app/config.json";
import { FileType, StuffixWithType, getFileType } from "@/assets/lib/preview";
export default {
  name: "file_manager_vue",
  model: {
    prop: "uploadList",
    event: "change"
  },
  props: {
    uploadList: {
      type: Array,
      default: function() {
        return [];
      }
    }
  },
  data() {
    return {
      defaultEncode: "utf-8",
      lastFile: null,
      isCanTry: false, //是否可以自己尝试解析
      activeFile: {},
      activePreview: {
        type: "", //文件类型
        name: "", //文件名称
        txtContent: "", //文本内容
        imgSrc: "", //图片内容,
        videoSrc: "", //视频内容
        audioSrc: "", //音频内容
        isLoading: false //是否处于解析状态
      },
      BuiltServiceConfig,
      requestPrefix: "/notepad/upload", //上传文件请求前缀
      uploadingList: [], //正在上传的文件
      isPreviewFile: false, //预览文件模态框
      isShowUpdate: false,
      FileType,
      StuffixWithType
    };
  },
  methods: {
    onChangFileType() {
      // 切换文件类型
      setTimeout(() => {
        this.resetActivePreview();
        this.onParseFile(this.activePreview.type);
      }, 20);
    },
    onPreviewFile(argItem) {
      this.isCanTry = false;
      //预览文件
      this.activeFile = { ...argItem };
      this.activePreview.name = argItem.name;
      this.activePreview.type = getFileType(argItem.name);
      this.onParseFile(this.activePreview.type);
      this.isPreviewFile = true;
    },
    onClosePreviewFileModal() {
      //关闭预览文件的模态框  清空状态

      this.resetActivePreview();
    },
    resetActivePreview() {
      this.activePreview.txtContent = "";
      this.activePreview.imgSrc = "";
      URL.revokeObjectURL(this.activePreview.audioSrc);
      URL.revokeObjectURL(this.activePreview.videoSrc);
    },
    async onParseFile(argType) {
      this.activePreview.isLoading = true;
      let data = fileToBlob[this.activeFile.id];
      if (!data) {
        /**
         * 对于视频和音频可以采用二进制播放的形式来快速响应，考虑到使用场景，就不做特殊化处理了
         */
        let response = await this.requestDownload(this.activeFile);
        data = response.data;
        fileToBlob[this.activeFile.id] = data;
      }

      var fileReader = new FileReader();
      switch (argType) {
        case FileType.txt:
          fileReader.readAsText(data, this.defaultEncode);
          fileReader.onload = event => {
            this.activePreview.txtContent = fileReader.result;
            this.activePreview.isLoading = false;
          };
          break;
        case FileType.img:
          fileReader.readAsDataURL(data);
          fileReader.onload = event => {
            this.activePreview.isLoading = false;
            this.activePreview.imgSrc = fileReader.result;
          };
          break;
        case FileType.video:
          {
            let videoSrc = URL.createObjectURL(data);
            this.activePreview.isLoading = false;
            this.activePreview.videoSrc = videoSrc;
          }

          break;
        case FileType.audio:
          {
            let audioSrc = URL.createObjectURL(data);
            this.activePreview.isLoading = false;
            this.activePreview.audioSrc = audioSrc;
          }

          break;
        default:
          this.isCanTry = true;
          this.activePreview.isLoading = false;
          break;
      }
    },

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
  computed: {
    computedDisabledFileRadio() {
      let isDisabled = this.activeFile.isLoading || !this.isCanTry;
      return isDisabled;
    }
  },
  beforeDestroy() {
    //卸载组件时清空数据,fileToBlob由于不在组件内部,所以需要手动清空
    fileToBlob = {};
  },
  mounted() {
    this.onGet();
  }
};
</script>