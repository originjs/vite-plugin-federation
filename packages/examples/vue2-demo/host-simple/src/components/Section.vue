<template>
  <section :class="$style.section">
    <h1 :class="$style.h1">This is a section from /host-simple.</h1>

    <slot />
  </section>
</template>

<script>
export default {
  name: 'Section'
}
</script>

<style module>
.h1 {
  border: 5px solid red !important;
  padding: 1px !important;
}
.section {
  border: 1px solid black;
  padding: 10px;
}
</style>
