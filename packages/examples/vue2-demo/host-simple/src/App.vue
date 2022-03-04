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
import RButton from 'remote-simple/remote-simple-button';
import RSection from 'remote-simple/remote-simple-section'
export default {
  name: 'App',
  components: {
    Section,
    Button: () => import('./components/Button.vue'),
    RemoteButton: RButton,
    RemoteSection: RSection
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
