import {createApp} from "vue";
import store from "./store.js"
import App from './App.vue'
// dev mode 防止 vite 去除 element-plus 的依赖，remote 无法找打 host's element-plus
// Uncaught ReferenceError: VueRouter is opnot defined
// VueRouter is not defined
import realRouter from './router/index.js'
// [dev mode] Uncaught (in promise) TypeError: Failed to fetch dynamically imported module: http://localhost:5104/node_modules/.vite/element-plus.js?v=525b4a31
// import ElMenu, {
//     ElAside,
//     ElButton,
//     ElCheckbox,
//     ElContainer,
//     ElFooter,
//     ElForm,
//     ElFormItem,
//     ElHeader,
//     ElInput,
//     ElMain
// } from 'element-plus'

const app = createApp(App)

// 1. 定义路由组件.
// 也可以从其他文件导入
// const Home = {template: '<p>Home</p>'}
// const RouterRemoteElementPlus = defineAsyncComponent(() => import("router-remote/ElementPlus"));

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
// const routes = [
//     {path: '/', component: Home},
//     {path: '/router-remote-element-plus', component: RouterRemoteElementPlus},
// ]

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
// const router = createRouter({
//     // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
//     history: createWebHashHistory(),
//     routes, // `routes: routes` 的缩写
// })

// 5. 挂载根实例
// app.component("router-remote-element-plus", RouterRemoteElementPlus);

//确保 _use_ 路由实例使
//整个应用支持路由。
// app.use(router)
app.use(realRouter)
app.use(store)

// app.use(ElButton)
//     .use(ElContainer)
//     .use(ElAside)
//     .use(ElMenu)
//     .use(ElHeader)
//     .use(ElMain)
//     .use(ElFooter)
//     .use(ElCheckbox)
//     .use(ElForm)
//     .use(ElFormItem)
//     .use(ElInput)

app.mount("#app");
