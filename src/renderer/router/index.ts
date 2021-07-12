import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router"
import config from "@/../config/config"
import { store } from "@/store/index";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
const lastVisitPage = localStorage.getItem("history/lastVisitePage"); //回复上次访问的页面

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        redirect: lastVisitPage || "/v1/apidoc/doc-list",
    },
    {
        path: "/login",
        name: "Login",
        component: () => import(/* webpackChunkName: "login" */ "@/pages/login/login.vue")
    },
    {
        path: "/layout",
        name: "Layout",
        component: () => import(/* webpackChunkName: "Layout" */ "@/pages/layout/layout.vue"),
        children: [{
            path: "/v1/test",
            name: "Test",
            component: () => import(/* webpackChunkName: "Test" */ "@/pages/test/test.vue"),
        }, {
            path: "/v1/permission",
            name: "Permission",
            component: () => import(/* webpackChunkName: "Permission" */ "@/pages/modules/permission/permission.vue"),
        }],
    },
    {
        path: "/:pathMatch(.*)*",
        name: "404",
        component: () => import(/* webpackChunkName: "404" */ "@/pages/layout/404/404.vue"),
    },
]
const router = createRouter({
    history: createWebHashHistory(),
    routes
})

//=====================================路由守卫====================================//
router.beforeEach((to, from, next) => {
    NProgress.start();
    const hasPermission = store.state.permission.routes.length > 0; //挂载了路由代表存在权限
    if (config.renderConfig.permission.whiteList.find((val) => val === to.path)) {
        //白名单内的路由直接放行
        next();
        return;
    }
    if (!hasPermission) {
        //未获取到路由
        store.dispatch("permission/getPermission").then(() => {
            next();
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            NProgress.done();
        });
    } else {
        next();
    }
});
router.afterEach((to) => {
    localStorage.setItem("history/lastVisitePage", to.fullPath);
    NProgress.done(); // 页面顶部的加载条
});
export {
    routes,
    router,
}
