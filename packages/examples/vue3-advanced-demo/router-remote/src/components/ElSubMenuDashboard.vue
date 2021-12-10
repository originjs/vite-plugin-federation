<template>
  <el-sub-menu index="1">
    <template #title>
      <span>Dashboard</span>
    </template>
    <el-menu-item-group>
      <el-menu-item index="/introduce"><i class="el-icon-data-line"/>Introduce</el-menu-item>
      <el-menu-item index="/dashboard"><i class="el-icon-odometer"/>Dashboard</el-menu-item>
    </el-menu-item-group>
  </el-sub-menu>
</template>

<script>
import {ElMenuItem, ElMenuItemGroup, ElSubMenu} from 'element-plus'
import Introduce from '../views/Introduce.vue'
import Dashboard from '../views/Dashboard.vue'

export default {
  components: {ElSubMenu, ElMenuItemGroup, ElMenuItem, Introduce, Dashboard},
  created() {
    const routes =
        [{
          path: '/introduce',
          name: 'introduce',
          component: Introduce
        }, {
          path: '/dashboard',
          name: 'dashboard',
          // component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue')
          component: Dashboard
        }]

    // 将自己 router 添加到 router-remote `routes`中
    routes.forEach(curRoute => {
      console.log(`The router-remote add its own routes ${curRoute.path}.`)
      this.$router.addRoute(curRoute)
    })
  },
}
</script>

<style module>
</style>
