<template>
  <div>
    <h1>Nuxt3 Host</h1>
    <p>This is a Nuxt3 host application.</p>
    <ClientOnly fallback="Loading...">
      <RemoteButton />
    </ClientOnly>
  </div>
</template>

<script setup>
import RemoteButton from './components/remoteBtn.vue'
</script>