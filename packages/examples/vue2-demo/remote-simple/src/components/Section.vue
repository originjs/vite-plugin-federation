<template>
  <section :class="$style.section">
    <h1>
      This is a section from /remote-simple.
    </h1>

    <slot />
  </section>
</template>

<script>
export default {
  name: 'Section',
}
</script>

<style module>
.section {
  border: 1px solid black;
  padding: 10px;
}
</style>