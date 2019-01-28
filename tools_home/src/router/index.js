import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: "*",
      component: () => import("@/components/index")
    },
    {
      path: "/test",
      component: () => import("@/components/test/test")
    },
    {
      path: "/test_service",
      component: () => import("@/components/test/service/service")
    },
    {
      path: "/notepad_vue",
      component: () => import("@/components/tools/notepad")
    },
    {
      path: "/clock_vue",
      component: () => import("@/components/tools/older/clock")
    },

    {
      path: "/math_postures",
      component: () => import("@/components/tools/math_postures")
    },
    {
      path: "/img_conventer",
      component: () => import("@/components/tools/img_conventer/img_conventer")
    },
    {
      path: "/gonna_something",
      component: () =>
        import("@/components/tools/gonna_something/gonna_something")
    }
  ]
});
export default router;
