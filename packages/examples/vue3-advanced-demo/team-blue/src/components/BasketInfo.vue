<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '../store'
const store = useStore();

const basketClass = computed(() => ({
  empty: store.items === 0,
  filled: store.items > 0
}))
</script>

<template>
  <div className="blue-basket" id="basket">
    <div :class="basketClass">basket: {{ store.items }} item(s)</div>
  </div>
</template>

<style>
#basket {
  align-self: baseline;
  grid-area: basket;
  justify-self: end;
  margin-top: 11px;
}

#basket .empty,
#basket .filled {
  border-radius: 5px;
  color: white;
  padding: 5px 10px;
}

#basket .empty {
  background-color: gray;
}

#basket .filled {
  background-color: seagreen;
}

.blue-basket {
  display: block;
  outline: 3px dashed royalblue;
  padding: 5px;
}

.blue-buy {
  display: block;
  outline: 3px dashed royalblue;
  padding: 5px;
}
</style>