<style lang="less">
@import '~@/assets/style/base.less';

</style>
<template>
  <div id="key_manager-vue-id">
    <Button class="first-btn" @click="$emit('on-back')">返回</Button>
    <Alert>设置密钥后，务必要验证下能否正常解密，确保进一步的安全性。防止出现有1个以上的密钥情况</Alert>
    <Form ref="formDomIview" :model="formValidate" :rules="ruleValidate">
      <FormItem label="密钥" prop="firstKey">
        <Input type="password" v-model="formValidate.firstKey"></Input>
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
export default {
  name: "key_manager_vue",
  model: {
    prop: "publicKey",
    event: "change"
  },
  props: {
    publicKey: String
  },
  data() {
    return {
      ruleValidate: {
        firstKey: [
          {
            required: true,
            message: " "
          }
        ],
        secondKey: [
          {
            required: true,
            message: " "
          },
          {
            validator: (rule, value, callback) => {
              if (this.formValidate.firstKey === this.formValidate.secondKey) {
                callback();
              } else {
                callback("两次密码不一致");
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
    onSubmit() {
      let formDomIview = this.$refs.formDomIview;
      formDomIview.validate(isValid => {
        console.log(isValid);
        if (isValid) {
          this.$Message.success("设置成功");
          formDomIview.resetFields();
          this.$emit("change", formValidate.firstKey);
        }
      });
    }
  },
  computed: {},
  mounted() {}
};
</script>