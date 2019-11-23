<template>
  <div id="notepad-id">
    <div class="wrapper">
      <div class="card-wrapper" v-if="showModelFlag === 'notepad'">
        <Button
          icon="ios-pricetag"
          class="first-btn tag-btn"
          @click="showModelFlag = 'tag'"
          >标签管理</Button
        >
        <Button
          icon="ios-folder"
          class="first-btn file-btn"
          @click="showModelFlag = 'file'"
          >文件管理</Button
        >
        <Button
          icon="md-lock"
          class="first-btn key-btn"
          @click="showModelFlag = 'key'"
          >密钥管理</Button
        >
        <Button @click="onInAdd()" type="primary" long>
          <span>添加</span>
        </Button>
        <Select
          class="filter-select"
          placement="top"
          @on-change="onChangeFilterTag()"
          style="margin-top:10px;"
          v-model="filterTagId"
          clearable
          placeholder="标签过滤"
        >
          <Option :key="item.id" v-for="item in tagList" :value="item.id">{{
            item.content
          }}</Option>
        </Select>
        <!-- 记事的展示 -->
        <div v-if="list && list.length > 0">
          <div
            v-for="(item, index) in list"
            :key="item.id"
            @mouseover="item.isMouseOver = true"
            @mouseout="item.isMouseOver = false"
          >
            <Card
              class="card"
              :bordered="false"
              :style="
                $browserMessage.isPC &&
                  item.isMouseOver && {
                    boxShadow: `0 1px ${item.shadowBlur}px ${item.shadowSpread}px rgba(0,0,0,${item.shadowAlpha})`,
                  }
              "
            >
              <p slot="title">
                <Icon type="md-book"></Icon>
                {{ item.title }}
                <span
                  v-if="item.tagId"
                  :style="{ color: getTag(item.tagId).color }"
                  >{{ item.tagId && " - " + getTag(item.tagId).content }}</span
                >
              </p>
              <div slot="extra" v-if="$browserMessage.isPC">
                <!-- 设置了密钥  且被加密的信息 -->
                <Checkbox
                  v-show="publicKey != null && item.isEncrypt"
                  :value="item.isDecripty"
                  @on-change="onToggleEncrypt(item, $event)"
                  >解密</Checkbox
                >
                <Button type="text" @click="onTop(item)">置顶</Button>
                <Icon
                  v-show="
                    !item.isEncrypt || (item.isEncrypt && publicKey != null)
                  "
                  type="ios-open-outline"
                  @click.stop="onInEdit(item, index)"
                  style="margin-right:10px;cursor:pointer;"
                ></Icon>
                <Button
                  @click.stop="onConfirmDelete(item, index)"
                  style="color: red;"
                  >删除</Button
                >
              </div>
              <div>
                <div style="color: #bab9b9;">
                  <span>创建日期</span>
                  :{{ item.createTime }}
                  <span style="margin-left: 30px;">修改日期</span>
                  :{{ item.updateTime }}
                </div>
                <Row>
                  <Col span="4" offset="20">
                    <Button @click="onCopyAll(item.content)" title="复制全文"
                      ><Icon size="18" type="ios-copy"
                    /></Button>
                  </Col>
                </Row>

                <ShowNotepadComponent
                  @onZoomImg="onZoomImg"
                  :data="item"
                ></ShowNotepadComponent>
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
        <Spin size="large" fix v-if="list === null"></Spin>
        <div class="no-data" v-if="list && list.length === 0">暂无数据</div>
      </div>
      <!-- 标签管理 -->
      <TagManagerComponent
        v-show="showModelFlag === 'tag'"
        @on-back="() => (this.showModelFlag = 'notepad')"
        v-model="tagList"
        @on-delete-callback="onDeleteTag"
      ></TagManagerComponent>
      <!-- 文件管理 -->
      <FileManagerComponent
        @on-back="() => (this.showModelFlag = 'notepad')"
        v-show="showModelFlag === 'file'"
        v-model="fileUploadList"
      ></FileManagerComponent>
      <!-- 密钥管理 -->
      <KeyManagerComponent
        @on-back="() => (this.showModelFlag = 'notepad')"
        :show="showModelFlag === 'key'"
        v-model="publicKey"
      ></KeyManagerComponent>
    </div>
    <!-- 修改记事 -->
    <Modal
      v-model="isVisible"
      :mask-closable="false"
      @on-cancel="onCancelEditModel"
      @on-visible-change="onChangeVisible"
    >
      <p slot="header"></p>
      <Checkbox
        v-show="publicKey != null"
        style="margin-bottom:10px;"
        v-model="activNotepad.isEncrypt"
        >加密</Checkbox
      >
      <div
        contenteditable="true"
        @paste="onPaste($event, activNotepad)"
        @drop="onDropFile($event, activNotepad)"
        @dragover="onDragOver"
      >
        <Input
          ref="autoFocusInput"
          @on-keyup.ctrl.enter="onCloseEditModel(activNotepad, activeIndex)"
          :clearable="true"
          :rows="10"
          placeholder="支持普通链接、图片链接、黏贴网络图片"
          v-model="activNotepad.content"
          type="textarea"
        />
      </div>
      <br />
      <br />
      <Select v-model="activNotepad.tagId">
        <Option :key="item.id" v-for="item in tagList" :value="item.id">{{
          item.content
        }}</Option>
      </Select>
      <br />
      <br />
      <Input
        :clearable="true"
        placeholder="输入标题"
        v-model="activNotepad.title"
      />

      <div slot="footer">
        <Button
          :loading="activNotepad.loadCount != 0"
          @click="onCloseEditModel(activNotepad, activeIndex)"
          type="primary"
          >确定</Button
        >
      </div>
    </Modal>
    <!--  -->
    <Modal v-model="isZoomImg" footer-hide fullscreen title="放大图片">
      <img :style="{ 'max-width': '100%' }" :src="activeImgSrc" alt />
    </Modal>
  </div>
</template>
<script>
import DateHelper from "@/assets/lib/DateHelper";
import TagManagerComponent from "./tag_manager";
import FileManagerComponent from "./file_manager";
import KeyManagerComponent from "./key_manager";
import ShowNotepadComponent from "./show_notepad";
import CryptoJS from "crypto-js";
export const BASE64_IMG_PROTOCOL = "base64img";
export default {
  name: "",
  data() {
    return {
      activeImgSrc: null,
      isZoomImg: false, //是否显示方大图片的模态框
      publicKey: null,
      isVisible: false,
      showModelFlag: "notepad", // tag 、 file
      fileUploadList: [],
      tagList: [],

      requestPrefix: "/notepad/notepad", //记事 请求前缀
      isShowAddModel: false,
      isShowEditModel: false,
      isShowDeleteModel: false,

      //当前活动的记事的索引
      pagination: {
        //记事 的分页器
        page: 1,
        size: 3,
      },
      list: null,
      activNotepad: {},
      activeIndex: 0,
      filterTagId: "", //用于过滤的标签id
    };
  },
  components: {
    TagManagerComponent,
    FileManagerComponent,
    KeyManagerComponent,
    ShowNotepadComponent,
  },

  methods: {
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
          if (clipboardItems[i].type.indexOf("image") !== -1) {
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
    onCancelEditModel() {
      //如果用户取消编辑不重置状态，那么当用户点击添加后取消  再点击编辑一个记事，确定后,会变成添加一个新的记事！
      this.isShowAddModel = false;
      this.isShowEditModel = false;
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
        padding: CryptoJS.pad.Pkcs7,
      });
      let string = CryptoJS.enc.Utf8.stringify(decrypt).toString();
      return string;
    },
    encrypt(argkey, argContent) {
      var srcs = CryptoJS.enc.Utf8.parse(argContent);
      var encrypted = CryptoJS.AES.encrypt(srcs, argkey, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      let string = encrypted.toString();
      return string;
    },
    getTag(argTagId) {
      let tag = this.tagList.find((el) => el.id === argTagId);
      return tag;
    },
    onInAdd() {
      this.activNotepad = {
        content: "",
        loadCount: 0, //用户黏贴图片的时候记录正在转换的图片个数,loadCount为0时,才可以提交图片
        base64: {},
      };
      this.isShowAddModel = true;
      this.isVisible = true;
    },
    onZoomImg(argSrc) {
      this.activeImgSrc = argSrc;
      this.isZoomImg = true;
    },
    onInEdit(argNotepad, argIndex) {
      this.activNotepad = JSON.parse(JSON.stringify(argNotepad));
      this.activNotepad.loadCount = 0;
      if (this.activNotepad.isEncrypt === true) {
        this.activNotepad.isEncrypt = false;
        if (!this.activNotepad.isDecripty) {
          //在编辑的时候处于解密状态
          this.activNotepad.isEncrypt = false;
          this.activNotepad.content = this.decrypt(
            this.publicKey,
            this.activNotepad.content,
          );
        }
      }
      this.isShowEditModel = true;
      this.activeIndex = argIndex;
      this.isVisible = true;
    },

    async onTop(argItem) {
      await this.requestTop(argItem);
      this.onGet(this.pagination, {
        tagId: this.filterTagId,
      });
      this.$Message.success("置顶成功");
    },
    requestTop(argItem) {
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/top",
        data: {
          id: argItem.id,
        },
      });
    },

    onChangeFilterTag() {
      //过滤内容发生变化
      this.pagination.page = 1;
      this.onGet(this.pagination, { tagId: this.filterTagId });
    },
    onChangePage(argPage) {
      //切换记事分页器
      this.pagination.page = argPage;

      this.onGet(this.pagination, { tagId: this.filterTagId });
    },
    async onDeleteTag(argId) {
      await this.requestDelTag(argId);
      this.onGet(this.pagination, {
        tagId: this.filterTagId,
      });
    },
    requestDelTag(argId) {
      //同步数据  将记事里面的标签数据删除
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/removeTag",
        data: {
          id: argId,
        },
      });
    },

    onConfirmDelete(argNotepad, argIndex) {
      //确认是否删除记事
      this.$Modal.confirm({
        title: "删除",
        content: "确认删除这条记事嘛?",
        onOk: () => {
          this.onDelete(argNotepad);
        },
      });
    },
    async onDelete(argNotepad) {
      await this.requestDelete(argNotepad);
      //从前端这里虽然在当前页没有数据时候会多请求一次,但是,一切因该以后台数据为准
      //也是为了将逻辑内聚在request_get
      this.onGet(this.pagination, {
        tagId: this.filterTagId,
      });
    },
    requestDelete(argNotepad) {
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/del",
        data: {
          id: argNotepad.id,
        },
      });
    },
    async onGet(argPagination, argFilter = {}) {
      this.list = null;
      let response = await this.requestGet(argPagination, argFilter);
      if (response.data.data.length === 0 && this.pagination.page > 1) {
        //获取的数据条数为0 且不是第一页  会根据后台返回的数据计算最大的一页进行请求
        let maxPage =
          ((response.data.total - 1) / this.pagination.size + 1) | 0;
        this.pagination.page = maxPage;
        this.onGet(this.pagination, {
          tagId: this.filterTagId,
        });
      } else {
        this.list = [];
        response.data.data.forEach((el) => {
          let notepad = this.convert(el);
          this.list.push(notepad);
        });
      }

      this.pagination.total = response.data.total;
    },
    requestGet(argPagination, argFilter = {}) {
      //得到日记信息

      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/get",
        data: {
          page: argPagination.page,
          size: argPagination.size,
          filter: argFilter,
        },
      });
    },
    convert(argNotepad) {
      //转换请求过来的日记数据
      let notepad = { ...argNotepad };
      let createTime = DateHelper.get_instance_timestamp(
        notepad.createTime,
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
          notepad.updateTime,
        ).get_format_date();
      }
      //根据创建时间域当前时间所差的天数   动态的改变鼠标悬浮的阴影
      Object.assign(notepad, {
        shadowBlur: 6,
        shadowAlpha: 0.2,
        shadowSpread: 0,
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
        this.onAdd(notepad);
      } else if (this.isShowEditModel) {
        this.onUpdate(notepad, argIndex);
      }
      this.isVisible = false;
      this.isShowAddModel = false;
      this.isShowEditModel = false;
    },
    async onAdd(argNotepad) {
      this.filterTagId = "";
      await this.requestAdd(argNotepad);
      this.pagination.page = 1;
      this.onGet(this.pagination);
    },
    requestAdd(argNotepad) {
      //提交添加记事

      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/add",
        data: argNotepad,
      });
    },
    async onUpdate(argNotepad, argIndex) {
      let response = await this.requestUpdate(argNotepad, argIndex);
      let notepad = this.convert(response.data.data);
      this.list.splice(argIndex, 1, notepad);
    },
    requestUpdate(argNotepad, argIndex) {
      //提交更改记事
      return this.$axios.request({
        method: "post",
        url: this.requestPrefix + "/update",
        data: argNotepad,
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
  },
  computed: {
    isCanChangePage() {
      //判断当前按下左右方向键,是否可以切换页码
      let isCan =
        !this.isVisible &&
        !this.isShowDeleteModel &&
        !this.isZoomImg &&
        this.showModelFlag === "notepad";
      return isCan;
    },
  },
  mounted() {
    this.onGet(this.pagination);
    document.addEventListener("keydown", this.onKeyboardChangePage, true);
  },
  beforeDestroy() {
    document.removeEventListener("keydown", this.onKeyboardChangePage, true);
  },
};
</script>

<style lang="less">
@import "~@/assets/style/base.less";

#notepad-id {
  font-size: 14px;

  //增大上面的空间 为了使过滤标签的下拉弹框能在上面弹出

  padding-top: 45px;

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
    width: 95%;
    max-width: 650px;
    margin: 0 auto;

    .card-wrapper {
      position: relative;
    }
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

    .img-wrapper {
      overflow: hidden;

      height: 200px;

      img {
        max-width: 100%;
      }
    }
  }

  .show-area {
    white-space: pre-wrap;
    word-break: break-all;
  }
}
</style>