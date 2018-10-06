// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import {i18n,loadLanguageAsync}  from './i18n'
import  $ from "jquery"
import "jquery-datetimepicker"
import "jquery.scrollbar/jquery.scrollbar.css"
import "jquery.scrollbar/jquery.scrollbar.js"
import "jquery-datetimepicker/jquery.datetimepicker.css"
import FormValidate from "./service/formValidate"
import velocity from 'velocity-animate';
import iView from 'iView';
import 'iview/dist/styles/iview.css';
import store from './vuex/store.js';
import vueTouch from 'vue-touch';


Vue.use(vueTouch,{name:"v-touch"});
Vue.use(i18n);
Vue.use(iView, {
  i18n: function(path, options) {
    let value = i18n.t(path, options)
    if (value !== null && value !== undefined) {
      return value
    }
    return ''
  }
})
Vue.locale = () => {};
Vue.directive('fly-datetimepicker',{
	inserted:function(el,bind){
		let $el = $(el);
		console.log(bind)
		
		$el[0].oninput = function(){
			
			console.log("触发")
		}
		$el.datetimepicker({
			onClose:function(){
				console.log('hide');
				$el.trigger("input");
			}
		})
	}
})
/*Vue.component('effect-group',{
	template:`
				<transition  name="very-special-transition" v-on:before-enter="beforeEnter" @enter="enter" :css="false">
					<div>2121321</div>
				</transition>
	`,
	methods:{
		beforeEnter(el){
			el.style.opacity = 0;
			el.style.transition = "opacity 1s"
			console.log("jin ru")
		},
		enter(el){
			// el.opacity = 1
		}
	}
})*/
Vue.component('my-special-transition', {
  functional: true,
  render: function (createElement, context) {
    var data = {
      props: {
        name: 'very-special-transition',
        mode: 'out-in'
      },
      on: {
        beforeEnter: function (el) {
          // ...
           el.style.opacity = 0;
			el.style.transition = "opacity 1s"
        },
        afterEnter: function (el) {
          // ...
          $(el).animate({
          	opacity:1
          })
        }
      }
    }
    console.log(context.children)
    return createElement('transition', data, context.children)
  }
})


Vue.component('datetimepicker-input',{
	model:{
		prop:'checked',
		event:'input'
	},
	props: {
	  checked: String
	},
	template:`<input type="text" v-bind:value="checked" />`,
	mounted:function(){
		let $el = $(this.$el);
		var _this = this;
		$el.datetimepicker({
			onChangeDateTime:function(){
				_this.$emit('input',$el.val());
			}
		});
	}
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App},
  template: '<App/>',
  i18n,
  store,
  watch:{
	"$route"(to,from){
	  // console.log(arguments)
	}
  },
  

})
