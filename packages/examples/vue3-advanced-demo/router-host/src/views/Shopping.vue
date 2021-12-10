<template>
  <router-remote-el-sub-menu-product-list/>
  <hr>
  <router-remote-el-sub-menu-shopping-cart/>
</template>

<script>
import {defineAsyncComponent} from 'vue'

const RouterRemoteProductList = defineAsyncComponent(() => import("router-remote/ProductList"));
const RouterRemoteShoppingCart = defineAsyncComponent(() => import("router-remote/ShoppingCart"));

export default {
  name: 'Shopping',
  components: {
    "router-remote-el-sub-menu-product-list": RouterRemoteProductList,
    "router-remote-el-sub-menu-shopping-cart": RouterRemoteShoppingCart,
  },
  setup() {
  }
}
</script>

<style>
</style>
