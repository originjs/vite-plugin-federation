<template>
  <img :src="this.vueLogo" :class="$style.image" alt="">
  <img itemprop="image/svg+xml" :src="this.viteLogo" :class="$style.image" alt="">
<!--  GET http://localhost:5000/assets/logo.17e50649.svg 404 (Not Found) -->
<!--  <img itemprop="image/svg+xml" :src="this.viteLogoOrg" :class="$style.image" alt="">-->
  <img itemprop="image/png" :src="this.originjsLogo" :class="$style.image" alt="">
</template>
<script>
import vueLogo from '../logo.png'

// import .svg file
import viteLogoBase from '../logo.svg';
const viteLogoUrl = new URL(viteLogoBase, new URL(import.meta.url).origin).href

export default {
  data() {
    return {
      vueLogo: vueLogo,
      // viteLogoOrg: viteLogoBase,
      viteLogo: viteLogoUrl,
      originjsLogo:"https://avatars.githubusercontent.com/u/81556572?s=200&v=4"
    }
  }
}
</script>
<style module>
.image {
  width: 50px;
}
</style>
