<template>
  <div :class="$style.green">{{ title }}</div>
  <p id='cart-item' :class="$style.green">cartItems from vuex: {{cartCount}}</p>
  <div :class="[$style.green, $style.bold]">green and bold</div>
</template>
<script>
export default {
  created() {
    console.log(this.$store.state.cartItems)
  },
  data() {
    return {
      title: 'Layout Component in Action..'
    }
  },
  computed:{
    cartCount() {
      return this.$store.state.cartItems
    }
  }
}
</script>
<style module>
.green {
  color: green;
}
.bold {
  font-weight: bold;
}
</style>
