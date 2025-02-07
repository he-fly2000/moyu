import { createApp } from "vue"
import ElementPlus from "element-plus";
import mixin from "@/mixin/index"
import { cache } from "./cache/cache"
import App from "./App.vue"
import { axiosPlugin } from "@/api/api"
import * as helper from "@/helper/index"
import "./registerServiceWorker"
import "element-plus/dist/index.css"
import "@/../../public/font/iconfont"
import "@/../../public/font/iconfont.css"
import { router } from "./router"
import { store, key } from "./store"
import { registeGlobalComponent } from "@/components"
import "@/assets/css/index.css"
import registeDirective from "./directive/directive";
import i18n from "@/i18n/i18n"

const app = createApp(App, {
    mixin: [mixin]
})

app.config.globalProperties.$helper = helper; //挂载全局辅助函数
app.config.globalProperties.$cache = cache; //挂载全局storage方法

registeGlobalComponent(app); //注册全局组件
registeDirective(app); //注册全局指令
app.use(store, key);
app.use(axiosPlugin).use(ElementPlus).use(router).use(i18n);
app.mount("#app")
