<style lang="less">
@import "~@/assets/style/base.less";

#img_conventer-vue-id {
  position: relative;

  width: 85%;
  max-width: 800px;
  margin: 0 auto;

  .load-img-group {
    position: absolute;

    transform: translateX(-120%);
  }

  #netwok-id textarea,
  #upload-id {
    height: 200px;
  }

  #netwok-id textarea {
    resize: none;
  }

  #upload-id {
    line-height: 200px;

    text-align: center;
  }

  .img-preview-wrapper {
    margin-top: 10px;

    .heade-wrapper {
      clear: both;
    }

    .img-preview {
      display: flex;

      margin: 10px auto;

      flex-wrap: wrap;

      img {
        max-width: 100%;
        margin: 2.5px;

        border: 3px solid#a5a5a5;

        flex-shrink: 1;
      }
    }
  }
}
</style>
<template>
  <div id='img_conventer-vue-id'>
    <RadioGroup
      class="load-img-group"
      v-model="loadImgWay"
      vertical
    >
      <Radio label="locale">本地</Radio>
      <Radio label="network">网络</Radio>
    </RadioGroup>
    <template v-if="loadImgWay === 'locale'">

      <Upload
        type="drag"
        :before-upload="before_upload"
        action=""
        accept="image/*"
        id="upload-id"
        multiple
      >
        <div>点击或拖拽上传</div>
      </Upload>
    </template>
    <template v-else-if="loadImgWay === 'network'">
      <Input
        @on-change="on_get_imgUrl"
        placeholder="在这里输入图片的网络地址"
        type="textarea"
        id="netwok-id"
      ></Input>
    </template>
    <!-- 图片预览区域 -->
    <div class="img-preview-wrapper">
      <div class="heade-wrapper">
        <Row>
          <div style="float:left;">
            <ButtonGroup>
              <Button
                :disabled="loadImgWay === 'network'"
                @click="on_download('BASE64',loadImgWay)"
              >下载base64码</Button>
              <Button
                :disabled="loadImgWay === 'network'"
                @click="on_download('IMG',loadImgWay)"
              >下载图片</Button>

            </ButtonGroup>
            <Button
              v-show="loadImgWay === 'locale'"
              @click="on_clear_imgs"
            >清空</Button>
          </div>
          <div style="float:right;">
            <Button @click="on_update_config">修改配置</Button>
          </div>

        </Row>
        <Row>
          <Alert
            style="margin-top:10px"
            type="warning"
            :closable="true"
            v-show="loadImgWay === 'network'"
          >
            直接通过浏览器转换会有跨域问题!后续需要可以计划通过nodejs服务器来实现
          </Alert>
        </Row>
      </div>
      <div class="img-preview">

        <template v-if="loadImgWay === 'locale'">

          <img
            ref="imgDomList"
            v-for="(item ,index) in imgFile"
            :key="index"
            :src="item.base64"
          >
        </template>
        <template v-else-if="loadImgWay === 'network'">

          <img
            ref="imgDomList"
            v-for="(item ,index) in networkImgInfo"
            :key="index"
            :src="item.url"
          >
        </template>
      </div>
    </div>
    <!-- 修改配置Modal -->
    <Modal
      title="修改配置"
      v-model="updateConfigModal.isShow"
      @on-ok="updateConfigModal.on_ok"
    >
      <Form
        :model="updateConfigModal.form"
        :label-width="200"
      >
        <FormItem label="下载base64码时去掉前缀">
          <Checkbox v-model="updateConfigModal.form.isIncludePrefix"></Checkbox>
        </FormItem>
        <FormItem label="统一转换为">
          <Select v-model="updateConfigModal.form.imgType">
            <Option
              v-for="(item,index) in imgType"
              :value="item.value"
              :key="index"
            >{{item.name}}</Option>
          </Select>
        </FormItem>
      </Form>
    </Modal>
    <!-- 用于绘制图片的canvas -->
    <canvas
      style="display:none;"
      ref="canvasDom"
    ></canvas>

  </div>
</template>
<script>
const IMG_FLAG = "IMG";
const BASE64_FLAG = "BASE64";
export default {
  name: "img_conventer_vue",
  data() {
    return {
      loadImgWay: "locale",
      _config: {}, //存储ajax获取的下载相关配置
      _requestConfigPrefix: "/img_conventer/config",
      /**
       * 承载上传图片的信息
       *  base64 base64码
       * name 图片名字
       */
      imgFile: [],
      /*
        承载网络图片信息
        url地址
        name 图片名字
        stuffix
  
      */
      networkImgInfo: [],
      imgType: [
        {
          name: "",
          value: ""
        },
        {
          name: "jpg、jpeg",
          value: "image/jpeg"
        },
        {
          name: "png",
          value: "image/png"
        },
        {
          name: "gif",
          value: "gif"
        },
        {
          name: "ief",
          value: "image/ief"
        }
      ],
      updateConfigModal: {
        isShow: false,
        form: {},
        on_ok: () => {
          this.request_save_config(this.updateConfigModal.form);
        }
      }
    };
  },
  methods: {
    on_clear_imgs() {
      this.imgFile = [];
    },
    on_get_imgUrl(argEvent) {
      this.networkImgInfo = [];
      let pattern = /(http|https):\/\/[\S]+/g;
      let value = argEvent.target.value;
      let match;
      while ((match = pattern.exec(value)) !== null) {
        let url = match[0];
        let index = url.lastIndexOf("/");
        let name = url.substring(index + 1);
        let stuffix = name.substring(name.lastIndexOf(".") + 1);
        this.networkImgInfo.push({ url, name, stuffix });
      }
    },
    before_upload(argFile) {
      let reader = new FileReader();
      reader.readAsDataURL(argFile);
      reader.onload = () => {
        this.imgFile.push({
          base64: reader.result,
          name: argFile.name
        });
      };
      return false;
    },
    on_download(argFlag, argLoadWay) {
      let imgDomList = this.$refs.imgDomList;
      let { imgType, isIncludePrefix } = this.$data._config;
      let base64List = [];
      if (argLoadWay === "locale") {
        base64List = this.imgFile.map(el => {
          return el.base64;
        });
        if (imgType !== "") {
          //进行转换

          base64List.forEach((base64, index, arr) => {
            //格式相同的不处理
            let isNotSame = base64.indexOf(imgType) == -1;
            if (isNotSame) {
              let imgDom = imgDomList[index];
              arr[index] = this.get_base64(imgDom, imgType);
            }
          });
        }
      } else if (argLoadWay === "network") {
        imgDomList.forEach((imgDom, index, arr) => {
          let type;
          if (imgType !== "") {
            type = imgType;
          } else {
            type = this.imgType.find((el, index, arr) => {
              if (
                el.name.lastIndexOf(this.networkImgInfo[index].stuffix) !== -1
              ) {
                return el;
              }
            }).imgType;
          }
          base64List[index] = this.get_base64(imgDom, type);
        });
      }

      if (argFlag === BASE64_FLAG) {
        if (isIncludePrefix) {
          //去掉前缀
          base64List.forEach((base64, index, arr) => {
            let prefixPos = base64.indexOf(",") + 1;
            arr[index] = base64.substring(prefixPos);
          });
        }
      }

      base64List.forEach((base64, index, arr) => {
        let filename = this.imgFile[index].name.substring(
          0,
          this.imgFile[index].name.lastIndexOf(".")
        );
        let href;
        if (argFlag === IMG_FLAG) {
          href = base64;
        } else if (argFlag === BASE64_FLAG) {
          let blob = new Blob([base64]);
          href = URL.createObjectURL(blob);
          filename += ".txt";
        }
        this.download(href, filename);
        URL.revokeObjectURL(href);
      });
    },
    on_update_config() {
      this.updateConfigModal.isShow = true;
      this.updateConfigModal.form = {
        ...this.$data._config
      };
    },
    download(argHref, argFileName) {
      let aDom = document.createElement("a");
      aDom.download = argFileName;
      aDom.style.display = "none";
      aDom.href = argHref;
      document.body.appendChild(aDom);
      aDom.click();
      document.body.removeChild(aDom);
    },
    get_base64(argImgDom, argImgType) {
      //通过将图片绘制在canvas上,进行图片格式的转换
      let canvasDom = this.$refs.canvasDom;
      canvasDom.width = argImgDom.naturalWidth;
      canvasDom.height = argImgDom.naturalHeight;
      let context = canvasDom.getContext("2d");
      context.drawImage(argImgDom, 0, 0);
      let base64 = canvasDom.toDataURL(argImgType);

      return base64;
    },

    async request_get_config() {
      let response = await this.$axios.request({
        method: "get",
        url: this.$data._requestConfigPrefix + "/get"
      });

      this.$data._config = response.data;
    },
    async request_save_config(argConfig) {
      let response = await this.$axios.request({
        method: "post",
        data: argConfig,
        url: this.$data._requestConfigPrefix + "/save"
      });
      this.$data._config = argConfig;
      this.$Message.success("修改成功");
    }
  },
  created() {
    this.request_get_config();
  },
  computed: {},
  mounted() {}
};
</script>