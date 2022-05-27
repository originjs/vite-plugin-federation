import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import federation from '@dilesoft/vite-plugin-federation-dynamic'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    federation({
      name: 'remote-simple',
      filename: 'remoteEntry.js',
      exposes: {
        './remote-simple-button': './src/components/Button.vue',
        './remote-simple-section': './src/components/Section.vue'
      },
      shared: ['vue']
    })
  ],
  build: {
    target: 'es2020',
    minify: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        minifyInternalExports: false
      }
    }
  }
})
