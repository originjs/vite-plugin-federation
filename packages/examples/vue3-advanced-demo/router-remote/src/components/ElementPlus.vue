<template>
  <div id="router-remote-element-plus">
    <p id='cart-item' :class="$style.gray">cartItems from vuex: {{ cartCount }}</p>
    <el-button @click="increase">ElButton</el-button>
  </div>
</template>

<script>
import {ElButton} from 'element-plus'

export default {
  components: {ElButton},
  computed: {
    cartCount() {
      return this.$store.state.cartItems
    }
  }, methods: {
    increase() {
      console.log(`method:increase: ${this.$store.state.cartItems}`)
      this.$store.state.cartItems++
    }
  }
}
</script>

<style module>
.gray {
  color: gray;
}
</style>

