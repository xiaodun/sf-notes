<style lang="less">
@import "~@/assets/style/base.less";

#img_conventer-vue-id {
  width: 85%;
  max-width: 800px;
  margin: 0 auto;
  #upload-id {
    height: 200px;

    text-align: center;
    line-height: 200px;
  }
  .img-preview-wrapper {
    margin-top: 10px;
  }
  .img-preview {
    display: flex;
    .heade-wrapper {
      clear: both;
    }
    .img-wrapper {
      margin: 5px;
    }
  }
}
</style>
<template>
  <div id='img_conventer-vue-id'>
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
    <div class="img-preview-wrapper">
      <div class="heade-wrapper">
        <Row>
          <div style="float:left;">
            <ButtonGroup>
              <Button>下载base64码</Button>
              <Button>下载图片</Button>

            </ButtonGroup>
          </div>
          <div style="float:right;">
            <Button>修改配置</Button>
          </div>
        </Row>
      </div>
      <div class="img-preview">
        <div
          v-for="(item ,index) in imgBase64list"
          :key="index"
          class="img-wrapper"
        >

          <img :src="item">
        </div>
      </div>
    </div>

  </div>
</template>
<script>
export default {
  name: "img_conventer_vue",
  data() {
    return {
      imgBase64list: [],
      imgType: [
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
          value: "image/gif"
        },
        {
          name: "ief",
          value: "ief"
        }
      ]
    };
  },
  methods: {
    before_upload(file) {
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imgBase64list.push(reader.result);
      };
      return false;
    }
  },
  computed: {},
  mounted() {}
};
</script>