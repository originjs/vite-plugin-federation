import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import autoprefixer from 'autoprefixer'
import topLevelAwait from 'vite-plugin-top-level-await'

// https://vitejs.dev/config/
export default defineConfig({
  css: {
    modules: {
      scopeBehaviour: 'local',
      localsConvention: 'camelCase'
    },
    postcss: { plugins: [autoprefixer()] }
  },
  plugins: [
    vue(),
    federation({
      name: 'css-modules',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/components/Button.vue'
      },
      shared: {
        vue:{
          generate:false
        }
      }
    }),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`
    })
  ],
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        format: 'es',
        minifyInternalExports: false
      }
    }
  }
})
