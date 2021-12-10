<template>
  <div class="cart">
    <h2>Your Cart</h2>
    <p v-show="!products.length">
      <i>Please add some products to cart.</i>
    </p>
    <ul>
      <li v-for="product in products" :key="product.id">
        {{ product.title }} - {{ product.price | currency }} x {{ product.quantity }}
      </li>
    </ul>
    <p>Total: {{ total | currency }}</p>
    <p>
      <el-button :disabled="!products.length" @click="checkout(products)">Checkout</el-button>
    </p>
    <p v-show="checkoutStatus">Checkout {{ checkoutStatus }}.</p>
  </div>
</template>

<script>

import {onBeforeMount} from "vue";
import {mapGetters, mapState, useStore} from 'vuex'
import {ElButton} from 'element-plus'
import cart from "../store/modules/cart";

export default {
  name: 'ProductList',
  components: {ElButton},
  setup() {
    const store = useStore()
    onBeforeMount(() => {
      if (!store.hasModule("cart")) {
        store.registerModule("cart", cart)
      }
    })
  },
  computed: {
    ...mapState({
      checkoutStatus: state => state.cart.checkoutStatus
    }),
    ...mapGetters('cart', {
      products: 'cartProducts',
      total: 'cartTotalPrice'
    })
  },
  methods: {
    checkout(products) {
      this.$store.dispatch('cart/checkout', products)
    }
  }
}
</script>
