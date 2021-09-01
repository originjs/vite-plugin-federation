<template>
  <div>
    <Section>
      <Button />
    </Section>
    <RemoteSection>
      <RemoteButton />
    </RemoteSection>
  </div>
</template>

<script>
import Section from './components/Section.vue'

export default {
  name: 'App',
  components: {
    Section,
    Button: () => import('./components/Button.vue'),
    RemoteButton: () => import('remote-simple/remote-simple-button'),
    RemoteSection: () => import('remote-simple/remote-simple-section'),
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
