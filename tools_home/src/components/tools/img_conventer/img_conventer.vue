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
    <!-- 图片预览区域 -->
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
            <Button @click="on_update_config">修改配置</Button>
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
  </div>
</template>
<script>
export default {
  name: "img_conventer_vue",
  data() {
    return {
      _config: {}, //存储ajax获取的下载相关配置
      _requestConfigPrefix: "/img_conventer/config",
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
    before_upload(argFile) {
      let reader = new FileReader();
      reader.readAsDataURL(argFile);
      reader.onload = () => {
        this.imgBase64list.push(reader.result);
      };
      return false;
    },
    on_update_config() {
      this.updateConfigModal.isShow = true;
      this.updateConfigModal.form = {
        ...this.$data._config
      };
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