<template>
  <button :class="$style.button" v-on:click="count++">
    <slot>host-simple's Button: {{ count }}</slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  data: function () {
    return {
      count: 0
    }
  }
}
</script>
<style module>
.button {
  background-color: red; /* Green */
  border: none;
  color: white;
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
}
</style>
