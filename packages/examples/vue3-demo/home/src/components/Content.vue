<template>
  <h1>Red</h1>
  <div :class="$style.red">{{ title }}</div>
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
