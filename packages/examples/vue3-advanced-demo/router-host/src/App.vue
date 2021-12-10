<template id="app">
  <div class="layout">
    <el-container v-if="state.showMenu" class="container">
      <el-aside class="aside">
        <div class="head">
          <div>
            <img src="https://avatars.githubusercontent.com/u/81556572?s=200&v=4" alt="logo">
            <span>vite-plugin-federation</span>
          </div>
        </div>
        <div class="line"/>
        <el-menu
            :default-openeds="state.defaultOpen"
            background-color="#222832"
            text-color="#fff"
            :router="true"
            :default-active='state.currentPath'
        >
          <el-menu-item-group>
            <el-menu-item index="/home"><i class="el-icon-s-home"/>Home</el-menu-item>
          </el-menu-item-group>
          <router-remote-el-sub-menu-dashboard/>
          <el-sub-menu index="3">
            <template #title>
              <span>Function display</span>
            </template>
            <el-menu-item-group>
              <el-menu-item index="/shopping"><i class="el-icon-shopping-bag-1"/>Shopping Test</el-menu-item>
            </el-menu-item-group>
          </el-sub-menu>
          <router-host-el-sub-menu-system-management/>
        </el-menu>
      </el-aside>
      <el-container class="content">
        <component-header/>
        <div class="main">
          <router-view/>
        </div>
        <component-footer/>
      </el-container>
    </el-container>
    <el-container v-else class="container">
      <router-view/>
    </el-container>
  </div>
  <!--  <hr/>-->
  <!--  <h1>Hello App! This is router-host</h1>-->
  <!--  <router-remote-element-plus/>-->
  <!--  <div>-->
  <!--    <p>-->
  <!--      &lt;!&ndash;使用 router-link 组件进行导航 &ndash;&gt;-->
  <!--      &lt;!&ndash;通过传递 `to` 来指定链接 &ndash;&gt;-->
  <!--      &lt;!&ndash;`<router-link>` 将呈现一个带有正确 `href` 属性的 `<a>` 标签&ndash;&gt;-->
  <!--      <router-link to="/">Go to Home |</router-link>-->
  <!--      <router-link to="/router-remote-element-plus"> Go to About |</router-link>-->

  <!--    </p>-->
  <!--    &lt;!&ndash; 路由匹配到的组件将渲染在这里 &ndash;&gt;-->
  <!--    <router-view></router-view>-->
  <!--  </div>-->
</template>

<script>
import {defineAsyncComponent, onUnmounted, reactive} from 'vue'
import {useRouter} from 'vue-router'
import {ElAside, ElContainer, ElMenu, ElMenuItem, ElMenuItemGroup, ElSubMenu} from 'element-plus'
import ElSubMenuSystemManagement from './components/ElSubMenuSystemManagement.vue'
import * as api from "./utils/hostUtils.js"

const RouterRemoteElSubMenuDashboard = defineAsyncComponent(() => import("router-remote/ElSubMenuDashboard"));
const RouterRemoteFooter = defineAsyncComponent(() => import("router-remote/Footer"));
// import RouterHostHeader from './components/Header.vue'
const RouterRemoteHeader = defineAsyncComponent(() => import("router-remote/Header"));
const RouterRemoteLogin = defineAsyncComponent(() => import("router-remote/Login"));

export default {
  components: {
    ElContainer, ElMenu, ElAside, ElMenuItemGroup, ElMenuItem, ElSubMenu,
    "router-remote-el-sub-menu-dashboard": RouterRemoteElSubMenuDashboard,
    // "login": Login,
    "login": RouterRemoteLogin,
    "component-header": RouterRemoteHeader,
    "component-footer": RouterRemoteFooter,
    "router-host-el-sub-menu-system-management": ElSubMenuSystemManagement
  },
  setup() {
    const noMenu = ['/login']
    const router = useRouter()
    const state = reactive({
      defaultOpen: ['1', '2', '3', '4'],
      showMenu: true,
      currentPath: '/dashboard',
      count: {
        number: 1
      }
    })
    // 监听浏览器原生回退事件
    if (window.history && window.history.pushState) {
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', () => {
        if (!api.localGet('token')) {
          state.showMenu = false
        }
      }, false);
    }
    const unwatch = router.beforeEach((to, from, next) => {
      console.log(router.getRoutes())
      if (to.path === '/login') {
        // 如果路径是 /login 则正常执行
        next()
      } else {
        // 如果不是 /login，判断是否有 token
        if (!api.localGet('token')) {
          // 如果没有，则跳至登录页面
          next({path: '/login'})
        } else {
          // 否则继续执行
          next()
        }
      }
      state.showMenu = !noMenu.includes(to.path)
      state.currentPath = to.path
      document.title = api.pathMap[to.name]
    })

    onUnmounted(() => {
      unwatch()
    })

    return {
      state
    }
  }
}
</script>
<style scoped>
.layout {
  min-height: 100vh;
  background-color: #ffffff;
}

.container {
  height: 100vh;
}

.aside {
  width: 200px !important;
  background-color: #222832;
  overflow: hidden;
  overflow-y: auto;
  -ms-overflow-style: none;
  overflow: -moz-scrollbars-none;
}

.aside::-webkit-scrollbar {
  display: none;
}

.head {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
}

.head > div {
  display: flex;
  align-items: center;
}

.head img {
  width: 50px;
  height: 50px;
  margin-right: 10px;
}

.head span {
  font-size: 20px;
  color: #ffffff;
}

.line {
  border-top: 1px solid hsla(0, 0%, 100%, .05);
  border-bottom: 1px solid rgba(0, 0, 0, .2);
}

.content {
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  overflow: hidden;
}

.main {
  height: calc(100vh - 100px);
  overflow: auto;
  padding: 10px;
}
</style>
<style>
body {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

.el-menu {
  border-right: none !important;
}

.el-submenu {
  border-top: 1px solid hsla(0, 0%, 100%, .05);
  border-bottom: 1px solid rgba(0, 0, 0, .2);
}

.el-submenu:first-child {
  border-top: none;
}

.el-submenu [class^="el-icon-"] {
  vertical-align: -1px !important;
}

a {
  color: #409eff;
  text-decoration: none;
}

.el-pagination {
  text-align: center;
  margin-top: 20px;
}

.el-popper__arrow {
  display: none;
}
</style>

