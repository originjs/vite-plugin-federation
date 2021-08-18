<template>
  <div id="common-lib-counter">
    <h1>{{ count }}</h1>
    <button @click="count = count + 1">Increment</button>
    <button @click="count = count - 1">Decrement</button>
  </div>
</template>

<script>
export default {
  data: function () {
    return {
      count: 0
    }
  }
}
</script>

<style>
#common-lib-counter {
  border: 2px solid;
}
</style>
