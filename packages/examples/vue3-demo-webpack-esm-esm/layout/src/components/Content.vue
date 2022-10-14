<template>
  <div :class="$style.green">{{ title }}</div>
  <p id='cart-item' :class="$style.green">cartItems from pinia: {{ cartCount }}</p>
  <div :class="[$style.green, $style.bold]">green and bold</div>
</template>

<script>
import { defineComponent,computed } from 'vue'
import { useStore } from '../store'

export default defineComponent({
  setup() {
    const store = useStore()
    let cartCount = computed(() => {
      return store.counter
    })

    return {
      cartCount,
      title: 'Layout Component in Action..'
    }
  },
})

</script>

<style module>
.green {
  color: green;
}

.bold {
  font-weight: bold;
}
</style>
