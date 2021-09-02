<template>
  <section :class="$style.section">
    <h1 :class="$style.h1">This is a section from /remote-simple.</h1>

    <slot />
  </section>
</template>

<script>
import styleSection from './Section.module.css'
import styleCommon from './Common.module.css'
export default {
  name: 'Section',
  computed: {
    $style() {
      return Object.assign(styleSection, styleCommon)
    }
  }
}
</script>
