import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
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
    target: ["chrome89", "edge89", "firefox89", "safari15"],
    minify: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        minifyInternalExports: false
      }
    }
  }
})
