<template>
  <div :class="$style.red">{{ title }}</div>
  <p id='cart-item' :class="$style.red">cartItems from vuex: {{cartCount}}</p>
  <div :class="[$style.red, $style.bold]">Red and bold</div>
</template>
<script>
export default {
  created() {
    console.log(this.$style.red)
  },
  data() {
    return {
      title: 'Remote Component in Action..'
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
.red {
  color: red;
}
.bold {
  font-weight: bold;
}
</style>
