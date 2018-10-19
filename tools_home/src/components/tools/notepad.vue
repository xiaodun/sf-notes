<template>
  <div id="notepad_vue">
    <h1 class="app_name" v-t="'ji_shi_ben'"></h1>
    <div class="card_wrapper">
      <Button @click="edit_notepad()" type="primary" long><span v-t="'tian_jia'"></span></Button>
      <div v-if="localeObj.notepads.length > 0">
      	<Card class="notepad_card" :bordered="false" v-for="(item,index) in filter_notepads" :key="item.id">
      		<p slot="title"><Icon type="md-book"></Icon>  {{item.title}}</p>
      		<div  slot="extra">
      			<Icon type="ios-open-outline"  @click.stop="edit_notepad(item)" style="margin-right:10px;"></Icon>	
      			<Button  v-t="'shan_chu'" @click.stop="confirm_delete(index)" style="color: red;"></Button>	
      		</div>
      		<div >
      			<div  style="color: #bab9b9;">
      				
	      			<span  v-t="'chuang_jian_ri_qi'" ></span>:{{item.createTime}} <span style="margin-left: 30px;" v-t="'xiu_gai_ri_qi'"></span>:{{item.updateTime}}
      			</div>
      			<div>
      				
	      			
      			</div>
      			<Input autosize class="show_area" type="textarea" readonly  style="border: none; margin-top: 5px;color: rgb(49,49,49)" v-model="item.content">
      				</Input>	

      		</div>
      	</Card>
        <Page v-if="localeObj.notepads.length >  pageSize" :current="currentPage"  @on-change="pageChange" style="margin-top: 20px;float: right;" :total="localeObj.notepads.length" :page-size="pageSize" show-total simple />
      </div>
      <div class="no_data" v-else v-t="'notepadVue_noData'">
      </div>
    </div>
    <Modal  v-model="model1" :mask-closable='false' @on-visible-change="visibleChange">
      <p slot="header"></p>
      <div>
        <Input ref="autoFocusInput" @on-enter.ctrl="close_model1" :clearable="true" :rows="10" :placeholder="$t('zai_ci_chu_shu_ru_nei_rong')" v-model="notepad.content" type="textarea"></Input>
        <br>
        <br>
        <Input   :clearable="true" :placeholder="$t('zai_ci_chu_shu_ru_biao_ti')" v-model="notepad.title"></Input>
      </div>
      <div slot="footer">
        <Button @click="close_model1()" type="primary" v-t="'que_ding'"></Button>
      </div>
    </Modal>
    <Modal v-model="model2" @on-ok="deleteItem()">
    	<div ><span v-t="'que_ding_shan_chu'"></span>?</div>
    </Modal>	

  </div>
</template>
<script>
import DateHelper from '@/assets/lib/DateHelper'
export default {
  name: "",
  data() {
    return {
      model1: false,
      model2:false,
      currentIndex:"",
      currentPage:1,
      pageSize:3,
	  filter_notepads:[],      
      localeObj: {

        uid: 0,
        notepads: []
      },
      notepad: {
        id: null,
        title: "",
        content: "",
        createTime: "",
        updateTime: ""
      },
    }
  },
  computed: {

  },
  methods: {
  	pageChange(index){
  		this.currentPage = index;
  		this.filter_notepads = this.localeObj.notepads.slice((index-1)*this.pageSize,index*this.pageSize)
  	},

  	confirm_delete(index){
  		this.currentIndex = index;
  		this.model2 = true;
  	},
    getNotepads() {
      let json = window.localStorage.getItem('notepad_vue')
      if (json) {

        this.localeObj = JSON.parse(json);
      }

    },
    saveNotepads() {
      window.localStorage.setItem('notepad_vue', JSON.stringify(this.localeObj))
    },
    visibleChange(){
    	this.$nextTick(()=>{
	        this.$refs.autoFocusInput.focus();
    	})
    },
    edit_notepad(notepad = {title: "",content: ""}) {
      this.model1 = true;
      this.notepad = Object.assign({},notepad);
    },
    deleteItem(index){
    	let start = this.currentIndex+(this.currentPage-1)*this.pageSize;
    	
    	this.localeObj.notepads.splice(start,1);
    	this.saveNotepads();
    	if(this.localeObj.notepads.length > this.currentPage*this.pageSize){
    		//当前页能够被保留
    		this.pageChange(this.currentPage);
    	}
    	else{
    		this.pageChange(this.currentPage - 1 > 1 ? this.currentPage : 1);
    	}
    },

    close_model1() {
      this.model1 = false;
      if (!this.notepad.id) {
        //创建
        this.notepad.id = DateHelper.getTimestamp() + " " + ++this.localeObj.uid;
        this.notepad.createTime = DateHelper.getDateFormatString('YYYY-MM-dd');
        if (!this.notepad.title.trim()) {
          this.notepad.title = this.notepad.createTime;
        }
        this.localeObj.notepads.unshift(this.notepad);
        this.pageChange(this.currentPage);
      }
      else{
      	//修改
      	this.notepad.updateTime = DateHelper.getDateFormatString('YYYY-MM-dd');
      	let notepad = this.localeObj.notepads.find(item=>item.id == this.notepad.id);
      	for(let key in this.notepad){
      		notepad[key] = this.notepad[key];
      	}
      }
      this.saveNotepads();

    }
  },
  created() {
    this.getNotepads();
    this.pageChange(this.currentPage);

  }
}

</script>
<style lang="less">
@import "~@/assets/style/base.less";
#notepad_vue {
  font-size: 14px;
  .app_name {
    text-align: center;
    margin: 1em auto;
  }
  .add_btn {

    width: 100px;
    height: 100px;
    font-size: 40px;
    display: block;
    margin: 10px auto;
  }
  .card_wrapper {
    width: 85%;
    max-width: 650px;
    margin: 0 auto;
  }
  .no_data {
    text-align: center;
    line-height: 40px;
  }
  .notepad_card{
  	margin-top: 10px;
  }
  .show_area .ivu-input{
  	border: none;
  	resize: none;
  	height: auto;
  }
}

</style>