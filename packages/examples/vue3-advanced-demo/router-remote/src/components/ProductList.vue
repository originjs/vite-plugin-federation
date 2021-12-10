<template>
  <div class="products">
    <h2>Products</h2>
    <ul>
      <li
          v-for="product in products"
          :key="product.id">
        {{ product.title }} - {{ product.price | currency }}
        <br>
        <el-button
            :disabled="!product.inventory"
            @click="addProductToCart(product)">
          Add to cart
        </el-button>
      </li>
    </ul>
  </div>
</template>

<script>
import {onBeforeMount} from 'vue'
import {mapActions, mapState, useStore} from 'vuex'
import {ElButton} from 'element-plus'

import products from '../store/modules/products'

export default {
  name: 'ProductList',
  components: {ElButton},
  setup() {
    const store = useStore()
    onBeforeMount(() => {
      if (!store.hasModule("products")) {
        store.registerModule("products", products)
      }
      store.dispatch('products/getAllProducts')
    })
  },
  computed: mapState({
    products: state => state.products.all
  }),
  methods: mapActions('cart', [
    'addProductToCart'
  ]),
  // 迁移到 onBeforeMount
  // created() {
  //   this.$store.dispatch('products/getAllProducts')
  // }
}
</script>
