import DateHelper from "@/assets/lib/DateHelper";
import * as NotepadRequest from "./NotepadRequest";
import {
  TagManagerComponent,
  FileManagerComponent,
  KeyManagerComponent,
  ShowNotepadComponent
} from "./component";

import CryptoJS from "crypto-js";
import { BASE64_IMG_PROTOCOL } from "./";

export default {
  name: "",
  data() {
    return {
      activeImgSrc: null,
      isZoomImg: false, //是否显示方大图片的模态框
      publicKey: null,
      showModelFlag: "notepad", // tag 、 file
      tagList: [],

      isShowAddModel: false,
      isShowEditModel: false,
      isShowDeleteModel: false,

      //当前活动的记事的索引
      pagination: {
        //记事 的分页器
        page: 1,
        size: 3
      },
      list: null,
      activNotepad: {
        /*
base64:{
  key:value
}
content:"L4CAHeDScIxfKPgeEqDPsw==" 笔记本内容
createTime:"2019-12-01" 创建时间
id:1575176618524 
isEncrypt:true  是否加密 标记从后台返回的状态
isMouseOver:false 鼠标是否悬浮
loadCount:0  当前正在转换为base64的图片个数
title:"2019-12-01" 记事标题
updateTime:"2019-12-01" 记事修改时间 
isDecripty:fasle  标记当前文本状态 是否在客户端被解密了
         */
      },
      activeIndex: 0,
      filterTagId: "" //用于过滤的标签id
    };
  },
  components: {
    TagManagerComponent,
    FileManagerComponent,
    KeyManagerComponent,
    ShowNotepadComponent
  },

  methods: {
    onLine($event) {
      $event.stopPropagation();
      const { target } = $event;
      let lineDom = $event.target.closest(".line");
      if (lineDom) {
        let highlightDom = lineDom.querySelector(".highlight-vue");
        if (target.classList.contains("run-btn")) {
          this.runJSCode(highlightDom.textContent);
        } else {
          if (highlightDom) {
            this.onCopyAll(highlightDom.textContent);
          } else {
            this.onCopyAll(lineDom.textContent);
          }
        }
        this.onSignLine($event);
      }
    },
    runJSCode(argCode) {
      console.clear();
      if (this.scripDom) {
        this.scripDom.remove();
      }
      this.scripDom = document.createElement("script");
      this.scripDom.textContent = `!function(){${argCode}}()`;
      document.body.appendChild(this.scripDom);
    },

    onSignLine($event) {
      let lineDom = $event.target.closest(".line");
      let currentTargetDom = $event.currentTarget;
      currentTargetDom.querySelectorAll(".line").forEach(dom => {
        dom.classList.remove("selected");
      });
      lineDom.classList.add("selected");
    },
    onBackNotepadPage() {
      //回到记事本页面
      this.showModelFlag = "notepad";
    },
    onDragOver($event) {
      //支持拖拽桌面上的图片
      const dataTransfer = $event.dataTransfer;
      $event.preventDefault();
      $event.stopPropagation();
      if (dataTransfer) {
        dataTransfer.dropEffect = "copy";
      }
    },
    onDropFile($event, argNotepad) {
      /**
       * 支持从网页拖拽图片 需要借助后台 参见今日头条
       */
      //网页、桌面拖拽图片
      $event.preventDefault();
      const dataTransfer = $event.dataTransfer;
      if (dataTransfer.types.includes("Files")) {
        //  从桌面拖拽文件到网页

        for (let i = 0; i < dataTransfer.files.length; i++) {
          const file = dataTransfer.files[i];
          this.dealBase64PRotocol(argNotepad, file);
        }
      }
    },
    onCopyAll(argText) {
      //复制全文

      const textarea = document.createElement("textarea");
      textarea.setAttribute("readonly", true);
      textarea.value = argText;
      document.body.appendChild(textarea);
      textarea.setSelectionRange(0, textarea.value.length);
      textarea.select();
      if (document.execCommand("copy")) {
        this.$Message.success("复制成功");
      } else {
        this.$Message.error("复制失败");
      }
      document.body.removeChild(textarea);
    },
    onPaste($event, argNotepad) {
      //从剪贴板来的内容
      var clipboardItems = $event.clipboardData && $event.clipboardData.items;
      if (clipboardItems && clipboardItems.length) {
        for (let i = 0; i < clipboardItems.length; i++) {
          if (
            clipboardItems[i].kind === "file" &&
            clipboardItems[i].type.indexOf("image") !== -1
          ) {
            /**
             * 确认为一个图片类型 只靠type或kind不行

                有道黏贴可能会出现  kind: "string", type: "text/yne-image-json"
             */
            const file = clipboardItems[i].getAsFile();
            this.dealBase64PRotocol(argNotepad, file);
            break;
          }
        }
      }
    },
    dealBase64PRotocol(argNotepad, argFile) {
      let reader = new FileReader();
      reader.onload = function(event) {
        //转换为自定义图片
        argNotepad.loadCount--;
        let fileName =
          BASE64_IMG_PROTOCOL +
          "://" +
          ((Math.random() * 1000000) | 0) +
          ".png";
        argNotepad.base64[fileName] = event.target.result;
        argNotepad.content += "\n" + fileName + "\n";
      };
      reader.readAsDataURL(argFile);
      argNotepad.loadCount++;
    },
    onToggleEncrypt(argItem, isChecked) {
      if (isChecked) {
        //解密
        argItem.content = this.decrypt(this.publicKey, argItem.content);
      } else {
        //加密
        argItem.content = this.encrypt(this.publicKey, argItem.content);
      }
      //标记当前文本状态
      argItem.isDecripty = isChecked;
    },
    decrypt(argkey, argContent) {
      var decrypt = CryptoJS.AES.decrypt(argContent, argkey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      let string = CryptoJS.enc.Utf8.stringify(decrypt).toString();
      return string;
    },
    encrypt(argkey, argContent) {
      var srcs = CryptoJS.enc.Utf8.parse(argContent);
      var encrypted = CryptoJS.AES.encrypt(srcs, argkey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      });
      let string = encrypted.toString();
      return string;
    },
    getTag(argTagId) {
      let tag = this.tagList.find(el => el.id === argTagId);
      if (!tag) {
        //可能是姐tag 接口还没有返回值 也可能是是切换分支导致没有这个id
        return {
          content: ""
        };
      }
      return tag;
    },
    onInAdd(argIndex = 0) {
      this.activNotepad = {
        content: "",
        loadCount: 0, //用户黏贴图片的时候记录正在转换的图片个数,loadCount为0时,才可以提交图片
        base64: {},
        tagId: this.filterTagId
      };
      this.isShowAddModel = true;
      this.addIndex = argIndex;
    },
    onZoomImg(argSrc) {
      this.activeImgSrc = argSrc;
      this.isZoomImg = true;
    },
    onInEdit(argNotepad, argIndex) {
      this.activNotepad = JSON.parse(JSON.stringify(argNotepad));
      this.activNotepad.loadCount = 0;
      if (this.activNotepad.isEncrypt) {
        if (!this.activNotepad.isDecripty) {
          //this.activNotepad.isDecripty 为true说明文本已经解密了
          //在编辑的时候处于解密状态

          this.activNotepad.content = this.decrypt(
            this.publicKey,
            this.activNotepad.content
          );
        }
      }
      this.isShowEditModel = true;
      this.activeIndex = argIndex;
    },

    onChangeFilterTag() {
      //过滤内容发生变化
      this.pagination.page = 1;
      this.onGet(this.pagination, { tagId: this.filterTagId });
      window.localStorage.filterTagId = this.filterTagId;
    },
    onChangePage(argPage) {
      //切换记事分页器
      this.pagination.page = argPage;

      this.onGet(this.pagination, { tagId: this.filterTagId });
    },

    onConfirmDelete(argNotepad, argIndex) {
      //确认是否删除记事
      this.$Modal.confirm({
        title: "删除",
        content: "确认删除这条记事嘛?",
        onOk: () => {
          this.onDelete(argNotepad);
        }
      });
    },

    onChangeVisible() {
      //编辑、修改记事的时候  自动获得焦点
      this.$nextTick(() => {
        this.$refs.autoFocusInput.focus();
      });
    },
    onKeyboardChangePage(event) {
      if (event.target !== document.body || !this.isCanChangePage) {
        //防止在其他文本区域移动光标时报错
        //防止在其他页面或着模态框触发切换
        return;
      }
      if (event.code === "ArrowLeft") {
        if (this.pagination.page > 1) {
          this.pagination.page--;
          this.onChangePage(this.pagination.page);
        }
      } else if (event.code === "ArrowRight") {
        let maxPage = Math.ceil(this.pagination.total / this.pagination.size);
        if (this.pagination.page < maxPage) {
          this.pagination.page++;
          this.onChangePage(this.pagination.page);
        }
      }
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

      return notepad;
    },
    onCloseEditModel(argNotepad, argIndex) {
      let notepad = { ...argNotepad };
      if (notepad.isEncrypt) {
        notepad.content = this.encrypt(this.publicKey, notepad.content);
      }
      //统一移除不存在的base64
      for (let base in argNotepad.base64) {
        if (argNotepad.content.indexOf(base) === -1) {
          delete argNotepad.base64[base];
        }
      }
      if (this.isShowAddModel) {
        this.onAdd(notepad, this.addIndex);
      } else if (this.isShowEditModel) {
        this.onUpdate(notepad, argIndex);
      }
      this.isShowAddModel = false;
      this.isShowEditModel = false;
    },
    async onDelete(argNotepad) {
      await NotepadRequest.del(argNotepad);
      //从前端这里虽然在当前页没有数据时候会多请求一次,但是,一切因该以后台数据为准
      //也是为了将逻辑内聚在request_get
      await this.onGet(this.pagination, {
        tagId: this.filterTagId
      });
    },
    async onDeleteTag(argId) {
      await NotepadRequest.delTag(argId);

      await this.onGet(this.pagination, {
        tagId: this.filterTagId
      });
    },
    async onTop(argItem) {
      await NotepadRequest.top(argItem);
      await this.onGet(this.pagination, {
        tagId: this.filterTagId
      });
      this.$Message.success("置顶成功");
    },

    async onGet(argPagination, argFilter = {}) {
      this.list = null;
      let response = await NotepadRequest.get(argPagination, argFilter);
      if (response.data.data.length === 0 && this.pagination.page > 1) {
        //获取的数据条数为0 且不是第一页  会根据后台返回的数据计算最大的一页进行请求
        let maxPage =
          ((response.data.total - 1) / this.pagination.size + 1) | 0;
        this.pagination.page = maxPage;
        this.onGet(this.pagination, {
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
    },
    async onAdd(argNotepad, argIndex) {
      await NotepadRequest.add(argNotepad, argIndex);
      this.pagination.page = 1;
      await this.onGet(this.pagination, {
        tagId: this.filterTagId
      });
    },

    async onUpdate(argNotepad, argIndex) {
      let response = await NotepadRequest.update(argNotepad, argIndex);
      let notepad = this.convert(response.data.data);
      this.list.splice(argIndex, 1, notepad);
    }
  },
  computed: {
    isCanChangePage() {
      //判断当前按下左右方向键,是否可以切换页码
      let isCan =
        !this.isShowNotepadModal &&
        !this.isShowDeleteModel &&
        !this.isZoomImg &&
        this.showModelFlag === "notepad";
      return isCan;
    },
    isShowNotepadModal: {
      //添加记事本 和 编辑记事本用的是一个模态框
      set(argValue) {
        //这个值目前逻辑只会是false,是关闭模态框时触发的,因为程序不应该直接this.isShowNotepadModal = true
        this.isShowEditModel = false;
        this.isShowAddModel = false;
      },
      get() {
        let isVisible = this.isShowAddModel || this.isShowEditModel;
        return isVisible;
      }
    }
  },
  created() {
    //初始化标签
    this.filterTagId = +window.localStorage.filterTagId;
  },
  mounted() {
    this.onGet(this.pagination, { tagId: this.filterTagId });
    document.addEventListener("keydown", this.onKeyboardChangePage, true);
  },
  beforeDestroy() {
    if (this.scripDom) {
      this.scripDom.remove();
    }
    document.removeEventListener("keydown", this.onKeyboardChangePage, true);
  }
};
