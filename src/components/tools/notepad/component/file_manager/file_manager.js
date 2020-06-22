//内置服务器配置
let fileToBlob = {
  //缓存文件数据
};
import _ from "lodash";
import BuiltServiceConfig from "@root/service/app/config.json";
import * as FileRequest from "./fileRequest";
import { FileType, StuffixWithType, getFileType } from "@/assets/lib/preview";
import { Prefix as RequestPrefix } from "./fileRequest";
export const DOWNLOAD_LIST = "downloadList";
export default {
  name: "file_manager_vue",

  data() {
    return {
      requestPrefix: RequestPrefix,
      checkedFileList: [], //记录选中文件的id
      isBatch: false, //是否开启批处理
      defaultEncode: "utf-8",
      lastFile: null,
      isCanTry: false, //是否可以自己尝试解析
      uploadList: [], //已经上传的文件
      activeFile: {},
      activePreview: {
        index: 0, //预览索引
        type: "", //文件类型
        name: "", //文件名称
        txtContent: "", //文本内容
        imgSrc: "", //图片内容,
        videoSrc: "", //视频内容
        audioSrc: "", //音频内容
        isLoading: false //是否处于解析状态
      },
      BuiltServiceConfig,

      uploadingList: [], //正在上传的文件
      isPreviewFile: false, //预览文件模态框
      isShowUpdate: false,
      FileType,
      StuffixWithType,
      //记录已下载的文件
      downloadList: []
    };
  },
  methods: {
    onToggleChecked(argFile) {
      if (!this.isBatch) {
        return;
      }
      if (this.checkedFileList.includes(argFile.id)) {
        let index = this.checkedFileList.findIndex(id => argFile.id === id);
        this.checkedFileList.splice(index, 1);
      } else {
        this.checkedFileList.push(argFile.id);
      }
    },
    onBatchConfirmDelFile() {
      if (this.checkedFileList.length === 0) {
        return;
      }

      this.onBatchDelFile();
    },
    async onBatchDownload() {
      if (this.checkedFileList.length === 0) {
        return;
      }
      const fileList = this.uploadList.filter(file =>
        this.checkedFileList.includes(file.id)
      );
      for (let i = 0; i < fileList.length; i++) {
        await this.onDownload(fileList[i]);
      }
      this.$Message.success("批量下载完成!");
    },
    onChangeBatchSwitch(argValue) {
      if (!argValue) {
        this.checkedFileList = [];
      }
    },

    onCheckedAll(argValue) {
      if (argValue) {
        let list = this.uploadList.map(item => item.id);
        this.checkedFileList = list;
      } else {
        this.checkedFileList = [];
      }
    },
    onChangeNext() {
      let index = this.activePreview.index + 1;
      if (index >= this.uploadList.length) {
        index = 0;
      }
      const currentItem = this.uploadList[index];
      this.onPreviewFile(currentItem, index);
    },
    onChangeResurce($event) {
      if (this.isPreviewFile) {
        const { keyCode } = $event;
        if (keyCode === 37) {
          this.onChangePrevious();
        } else if (keyCode === 39) {
          this.onChangeNext();
        }
      }
    },
    onChangePrevious($event) {
      let index = this.activePreview.index - 1;
      if (index < 0) {
        index = this.uploadList.length - 1;
      }
      const currentItem = this.uploadList[index];
      this.onPreviewFile(currentItem, index);
    },
    onChangFileType() {
      // 切换文件类型
      setTimeout(() => {
        this.resetActivePreview();
        this.onParseFile(this.activePreview.type);
      }, 20);
    },
    onPreviewFile(argItem, argIndex) {
      this.isCanTry = false;
      //预览文件
      this.activeFile = { ...argItem };
      this.activePreview.name = argItem.name;
      this.activePreview.index = argIndex;
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
        uploadingFile.id = _.uniqueId();
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
    async onBatchDelFile() {
      for (let i = 0; i < this.checkedFileList.length; i++) {
        const id = this.checkedFileList[i];
        await FileRequest.del(id);
      }
      this.$Message.success("删除成功");
      this.checkedFileList = [];
      this.onGet();
    },
    async onParseFile(argType) {
      this.activePreview.isLoading = true;
      let data = fileToBlob[this.activeFile.id];
      if (!data) {
        /**
         * 对于视频和音频可以采用二进制播放的形式来快速响应，考虑到使用场景，就不做特殊化处理了
         */
        let response = await FileRequest.download(this.activeFile);
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
      let response = await FileRequest.update(argItem);
      this.$Message.success("修改成功");
      this.isShowUpdate = false;
      this.lastFile.describe = argItem.describe;
    },
    async onDownload(argItem) {
      argItem.isDownloading = true;
      let response = await FileRequest.download(argItem);
      var blob = response.data;
      if (blob.type === "application/json") {
        const reader = new FileReader();
        reader.readAsText(blob, "utf-8");
        reader.onload = () => {
          let data = JSON.parse(reader.result);
          if (data.flag === -1) {
            this.$Message.error("该文件已经被删除了");
            //移除这个文件
            _.pullAllBy(this.uploadList, [{ id: argItem.id }], "id");
            this.uploadList = [...this.uploadList];
          }
        };
      } else {
        var a = document.createElement("a");
        a.download = argItem.name;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(a.href);
        this.downloadList.push(argItem.id);
        sessionStorage[DOWNLOAD_LIST] = JSON.stringify(this.downloadList);
      }

      argItem.isDownloading = false;
    },

    async onDelete(argItem) {
      this.onToggleChecked(argItem);
      await FileRequest.del(argItem.id);
      this.$Message.success("已删除!");
      this.onGet();
    },

    async onGet() {
      let response = await FileRequest.get();
      this.uploadList = response.data.map((el, index, arr) => {
        return {
          ...el,
          describe: el.describe || "",
          isDownloading: false
        };
      });
    }
  },
  computed: {
    computedDisabledFileRadio() {
      let isDisabled = this.activeFile.isLoading || !this.isCanTry;
      return isDisabled;
    },
    isCheckedAll: {
      get() {
        let isChecked =
          this.checkedFileList.length !== 0 &&
          this.checkedFileList.length === this.uploadList.length;
        return isChecked;
      },
      set(argValue) {
        return argValue;
      }
    }
  },
  beforeDestroy() {
    //卸载组件时清空数据,fileToBlob由于不在组件内部,所以需要手动清空
    fileToBlob = {};
    document.removeEventListener("keyup", this.onChangeResurce);
  },
  mounted() {
    this.onGet();
    this.downloadList =
      JSON.parse(window.sessionStorage[DOWNLOAD_LIST] || null) || [];
    document.addEventListener("keyup", this.onChangeResurce);
  }
};
