<template>
  <div id="lol_box_vue">
  	<!-- 
		原先是用jquery写的  为例整合把它移动到vuecli中
  	 -->
  	<template v-if="version == 1">
	  	<div class="content"></div>
		<div class="content"></div>
		<div class="content"></div>
		<div class="content"></div>
		<div class="content"></div>
		<ul class="page_button">
			<li>1</li>
			<li>2</li>
			<li>3</li>
			<li>4</li>
			<li>5</li>
		</ul>
  	</template>
  	<template v-else>
  		
  		<v-touch @swipedown="swipe($event,'down',index)" @swipeup="swipe($event,'up',index)" class="content" v-for="(item,index) in 5" :key="item"></v-touch>
  				<ul class="page_button">
  					<li>1</li>
  					<li>2</li>
  					<li>3</li>
  					<li>4</li>
  					<li>5</li>
  				</ul>
  	</template>
  </div>
</template>
<script>
export default {
	name:"",
	data(){
		return{
			version:1
		}
	},
	computed:{

	},
	methods:{
		swipe($event,direction,index){
			let win_h = $(window).height();
			if (-((parseInt($(".content:eq(0)").css("margin-top")) || 0) / win_h) == index) {
			    //是当前
			    if (direction == 'up') {
			        //向下
			        if(index == $(".content").length - 1) return;
			  
		  
		            let scroll_top = (index + 1) * win_h;
		            $(".content:eq(0)").css({ "margin-top": -scroll_top });
			    } else {
			    	//向上
			    	if(index == 0) return;
			    	
		    	    let scroll_top = (index - 1) * win_h;
		    	    $(".content:eq(0)").css({ "margin-top": -scroll_top });
			    	
			    }
			}
		}
	},
	mounted(){
		this.version = this.$route.query && this.$route.query.version || 1;
		if(this.version == 1){

			$(function() {

			    $(".page_button li").click(function() {
			        let win_h = $(window).height();
			        let index = $(this).index();
			        let scroll_top = index * win_h;
			        $(".content:eq(0)").css({ "margin-top": -scroll_top });
			    })
			    var count = 0;
			    var area = 2;//触发mousewheel的次数最小值
			    $(".content").on("mousewheel", function($event, data) {

			        let index = $(this).index();
			        let win_h = $(window).height();
			        if (-((parseInt($(".content:eq(0)").css("margin-top")) || 0) / win_h) == index) {
			            //是当前
			            if ($event.originalEvent.deltaY > 0) {
			                
			                //向下
			                if(index == $(".content").length - 1) return;
			                if (count < 0) count = 0;

			                if (count++ > area) {
			                	count = 0
			                    let scroll_top = (index + 1) * win_h;
			                    $(".content:eq(0)").css({ "margin-top": -scroll_top });
			                }
			            } else {
			            	//向上
			            	if(index == 0) return;
			            	if (count > 0) count = 0;

			            	if (count-- > -area) {
			            		count = 0
			            	    let scroll_top = (index - 1) * win_h;
			            	    $(".content:eq(0)").css({ "margin-top": -scroll_top });
			            	}
			            }
			        }

			    })
			})
		}
		else{
			$(function() {

			    $(".page_button li").click(function() {
			        let win_h = $(window).height();
			        let index = $(this).index();
			        let scroll_top = index * win_h;
			        $(".content:eq(0)").css({ "margin-top": -scroll_top });
			    })
			})
		}
	}
}

</script>
<style lang="less">
@import "../../assets/style/base.less";
*{
	margin: 0;
	padding: 0;
}
html,body,#app,#lol_box_vue{
	width: 100%;
	height: 100%;
}
#lol_box_vue{
	overflow: hidden;
}
.content{
	width: 100%;
	height: 100%;
	transition: margin 1.05s ease-in-out;
	&:nth-child(1){
		background-color: red;
	};
	&:nth-child(2){
		background-color: blue;
	};
	&:nth-child(3){
		background-color: green;
	};
	&:nth-child(4){
		background-color: black;
	};
	&:nth-child(5){
		background-color: yellow;
	};
}
.page_button {
	width: 30px;
    position: fixed;
    right: 0;
    list-style: none;

    cursor: pointer;
    top: 200px;
    li{
        float: left;
        border: 1px solid #000;
        width: 30px;
        height: 30px;
        text-align: center;
        line-height: 30px;
        background-color: #fff;
    }
}
</style>
