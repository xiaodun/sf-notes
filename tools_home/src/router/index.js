import Vue from 'vue'
import Router from 'vue-router'
import {i18n,loadLanguageAsync}  from '../i18n'
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/test',
      component:()=>import('@/components/test'),

    },
    // {
    //   path: '/lol_box',
    //   component:()=>import('@/components/tools/lol_box'),

    // },
    {
      path: '/notepad_vue',
      component:()=>import('@/components/tools/notepad'),

    },
    {
      path: '/clock_vue',
      component:()=>import('@/components/tools/clock'),
      

    },
    // {
    //   path: '/wave',
    //   component:()=>import('@/components/tools/wave'),

    // },
    {
      path: '/rotate_clock',
      component:()=>import('@/components/tools/rotate_clock'),

    },
    {
    	path:'/math_postures',
    	component:()=>import('@/components/tools/math_postures')
    },
    {
    	path:"/",
    	component:()=>import('@/components/index')
    }
  ]
})

router.beforeEach((to,form,next) => {
    loadLanguageAsync('zh-CN').then(()=>next())
})

export default router