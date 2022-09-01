<template>
  <div :class="$style.red">{{ title }}</div>
  <p id='cart-item' :class="$style.red">cartItems from pinia: {{ cartCount }}</p>
  <div :class="[$style.red, $style.bold]">Red and bold</div>
</template>

<script>
import { useStore } from '../store'

export default {
  data() {
    return {
      title: 'Remote Component in Action..'
    }
  },
  computed: {
    cartCount() {
      const store = useStore();
      return store.counter
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
