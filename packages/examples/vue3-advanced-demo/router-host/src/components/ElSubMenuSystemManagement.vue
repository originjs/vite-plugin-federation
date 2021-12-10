<template>
  <el-sub-menu index="4">
    <template #title>
      <span>System Management</span>
    </template>
    <el-menu-item-group>
      <el-menu-item index="/account"><i class="el-icon-lock" />Change Password</el-menu-item>
    </el-menu-item-group>
  </el-sub-menu>
</template>

<script>
import {ElMenuItem, ElMenuItemGroup, ElSubMenu} from 'element-plus'

export default {
  components: {ElSubMenu, ElMenuItemGroup, ElMenuItem}
}
</script>

<style module>
</style>
