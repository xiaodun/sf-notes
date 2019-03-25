<style lang="less">
@import '~@/assets/style/base.less';

</style>
<template>
  <div id="key_manager-vue-id" v-show="show">
    <Button class="first-btn" @click="onBack">返回</Button>
    <Alert>设置密钥后，务必要验证下能否能正常解密。</Alert>
    <Form ref="formDomIview" :model="formValidate" :rules="ruleValidate">
      <FormItem label="密钥" prop="firstKey">
        <Input ref="firstIViewComponent" type="password" v-model="formValidate.firstKey"></Input>
      </FormItem>
      <FormItem label="确认密钥" prop="secondKey">
        <Input type="password" v-model="formValidate.secondKey"></Input>
      </FormItem>
      <FormItem>
        <Button @click="onSubmit" type="primary">确定</Button>
      </FormItem>
    </Form>
  </div>
</template>
<script>
import CryptoJS from "crypto-js";

export default {
  name: "key_manager_vue",
  model: {
    prop: "publicKey",
    event: "change"
  },
  props: {
    show: Boolean,
    publicKey: Object
  },
  data() {
    return {
      ruleValidate: {
        firstKey: [
          {
            required: true,
            message: " "
          },
          {
            validator: (rule, value, callback) => {
              if (value && this.formValidate.secondKey) {
                let formDomIview = this.$refs.formDomIview;
                formDomIview.validateField("secondKey");
              }
              callback();
            }
          }
        ],
        secondKey: [
          {
            required: true,
            message: " "
          },
          {
            validator: (rule, value, callback) => {
              if (value) {
                if (
                  this.formValidate.firstKey === this.formValidate.secondKey
                ) {
                  callback();
                } else {
                  callback("两次密码不一致");
                }
              }
            }
          }
        ]
      },
      formValidate: {
        firstKey: "",
        secondKey: ""
      }
    };
  },
  methods: {
    onBack() {
      let formDomIview = this.$refs.formDomIview;
      formDomIview.resetFields();
      this.$emit("on-back");
    },
    onSubmit() {
      let formDomIview = this.$refs.formDomIview;
      formDomIview.validate(isValid => {
        if (isValid) {
          this.$Message.success("设置成功");
          setTimeout(() => {
            formDomIview.resetFields();
          }, 20);
          let key = CryptoJS.enc.Utf8.parse(this.formValidate.firstKey);
          this.$emit("change", key);
          this.onBack();
        }
      });
    }
  },
  computed: {},
  watch: {
    show(newValue) {
      if (newValue) {
        this.$nextTick(() => {
          this.$refs.firstIViewComponent.focus();
        });
      }
    }
  },
  mounted() {}
};
</script>