<template>
  <div id="test_service_vue">
    <div class="describe">
      <p style="color:red;">
        首先请确保内置服务器已经开启! <br> 
        端口和服务器配置的端口一样!
         /service/app/service.js <br>
         脚手架配置了请求转发
        
      </p>
      <p>
        同目录下的config.js是配置文件
      </p>
      <p>
        程序会在service.js同级或配置对应的目录下创建prefix + appName + dataName 的文件夹结构,并在下面创建 dataName + ".json",
        并为每个命令创建一个js文件
      </p>
      <p>
        所有的命令围绕json文件进行增删改查
      </p>
      <p style="color:red;">
        程序虽然会为每个命令生成统一的模板  但实现命令的逻辑仍需要手动编写
      </p>
      <p style="margin-bottom:20px;">正常的测试为用post发起存入一个数据请求,然后编写对应命令的js，完成存储,在进行get查询</p>
    </div>
    <Form ref="serviceForm" :model="serviceForm" :label-width="100" :rules="validatorRules">
      <FormItem label="端口:" prop="port">
        <Input type="text" v-model="serviceForm.port" />
      </FormItem>
      <FormItem label="前缀:" prop="prefix">
        <Input type="text" v-model="serviceForm.prefix" />
      </FormItem>
      <FormItem label="应用名:" prop="appName">
        <Input type="text" v-model="serviceForm.appName" />
      </FormItem>
      <FormItem label="数据名:" prop="dataName">
        <Input type="text" v-model="serviceForm.dataName" />
      </FormItem>
      <FormItem label="命令:" prop="command">
        <Input type="text" v-model="serviceForm.command" />
      </FormItem>
      <FormItem label="请求类型:">
        <RadioGroup v-model="serviceForm.requestType">
          <Radio  label="get">Get</Radio>
          <Radio label="post">Post</Radio>
        </RadioGroup>
      </FormItem>
      <FormItem label="存储数据:" v-if="serviceForm.requestType == 'post'">
        <Input type="textarea" readonly v-model="serviceForm.postContent" />
      </FormItem>
      <FormItem label="查询参数:" v-if="serviceForm.requestType == 'get'">
        <Input type="textarea" readonly v-model="serviceForm.getContent" />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="handleSubmit">提交</Button>
      </FormItem>
    </Form>
    <Divider>返回结果</Divider>
    <div ref="result_dom"></div>
  </div>
</template>
<script>
import axios from "axios";
import VConsole from "vconsole";
var vConsole = new VConsole();
export default {
  name: "test_service_vue",
  data() {
    return {
      result:"",
      serviceForm: {
        port:8888,
        requestType: "post",
        command: "",
        appName: "test",
        dataName: "test",
        prefix: "api",
        
        postContent:JSON.stringify([
          {
            id:12,
            color:"red",
          },
          {
            id:13,
            color:"green",
          }
        ]),
        getContent:"id=12",
      },
      validatorRules: {
        port: [
          {
            required: true,message:" "
          }
        ],
        command: [
          {
            required: true,message:" "
          }
        ],
        appName: [
          {
            required: true,message:" "
          }
        ],
        dataName: [
          {
            required: true,message:" "
          }
        ],
        prefix: [
          {
            required: true,message:" "
          }
        ]
      }
    };
  },
  computed: {},
  methods: {
    handleSubmit(){
      this.$refs.serviceForm.validate((valid)=>{
        if(valid){
          let url = `/${this.serviceForm.prefix}/${this.serviceForm.appName}/${this.serviceForm.dataName}/${this.serviceForm.command}`;
          if(this.serviceForm.requestType == 'post'){
            axios.post(url,{
              data:JSON.parse(this.serviceForm.postContent),
            })
            .then((response)=>{
              this.$refs.result_dom.textContent = JSON.stringify(response.data);
            })
            .catch((response)=>{
              this.$refs.result_dom.textContent = JSON.stringify(response.data);
            })
            
          }
          else if(this.serviceForm.requestType == 'get'){
            axios.get(url+"?"+this.serviceForm.getContent).then(response=>{
               this.$refs.result_dom.textContent = JSON.stringify(response.data);
            })
            .catch((response)=>{
                
               this.$refs.result_dom.textContent = JSON.stringify(response.data);

            })
          }
        }
      })
    }
  },
  mounted() {}
};
</script>
<style lang="less">
#test_service_vue {
  width: 85%;
  max-width: 900px;
  margin: 20px auto;
  .describe{
    margin-left:100px;
    p{
      font-size: 16px;
      margin-bottom: 3px;
    }
  }
  .result{
    margin-left:100px;
  }
}
</style>