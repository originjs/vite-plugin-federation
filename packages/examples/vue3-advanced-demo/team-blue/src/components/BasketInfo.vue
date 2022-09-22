<script setup lang="ts">
import { computed } from "vue"
const count = computed(() => 1)
</script>

<template>
  <div className="blue-basket" id="basket">
    <div>basket: {{ count }} item(s)</div>
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
</style>