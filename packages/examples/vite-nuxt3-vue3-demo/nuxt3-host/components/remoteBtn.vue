<template>
   <RemoteButton />
</template>

<script setup>
import { defineAsyncComponent } from 'vue'

const RemoteButton = defineAsyncComponent(() =>
  import('viteVue3Remote/Button')
)
</script>