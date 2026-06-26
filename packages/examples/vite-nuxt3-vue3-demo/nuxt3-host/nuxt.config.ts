import { defineNuxtConfig } from 'nuxt/config'
import { addVitePlugin, createResolver } from '@nuxt/kit'
import {nuxtFederationVitePlugin } from '@originjs/vite-plugin-federation'

export default defineNuxtConfig({
  modules: [
    '@pinia/nuxt',
    (_options, nuxt) => {
      const { resolvePath } = createResolver(import.meta.url)

      addVitePlugin(
        nuxtFederationVitePlugin({
          nuxtResolve: resolvePath,
          name: 'nuxt3-host',
          remotes: {
            viteVue3Remote: 'http://localhost:5001/assets/remoteEntry.js'
          },
          shared: ['vue', 'pinia'],
          asyncRemoteModule: {
            awaitEffect: '__tla'
          }
        }),
        { prepend: false, server: false }
      )
    }
  ],
  vite: {
    optimizeDeps: {
      exclude: ['vue', 'pinia'],
    },
    build: {
      target: 'esnext',
      cssCodeSplit: false
    }
  }
})