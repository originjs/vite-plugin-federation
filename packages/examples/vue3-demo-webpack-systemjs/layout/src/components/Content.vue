<template>
  <div :class="$style.green">{{ title }}</div>
  <p id='cart-item' :class="$style.green">cartItems from pinia: {{cartCount}}</p>
  <div :class="[$style.green, $style.bold]">green and bold</div>
</template>
<script>
import { useStore } from '../store'

export default {
  data() {
    return {
      title: 'Layout Component in Action..'
    }
  },
  computed:{
    cartCount() {
      const store = useStore();
      return store.counter
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
