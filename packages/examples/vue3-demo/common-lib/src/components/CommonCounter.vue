<template>
  <div id="common-lib-counter">
    <h1 :class="$style.orange">{{ count }}</h1>
    <button :class="$style.button" @click="count = count + 1">Increment</button>
    <button :class="$style.button" @click="count = count - 1">Decrement</button>
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

<style module>
#common-lib-counter {
  border: 5px solid;
}
.orange {
  color: orange;
}
.button {
  background-color: orange; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}
</style>
