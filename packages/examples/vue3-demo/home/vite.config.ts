import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'home',
      filename: 'remoteEntry.js',
      exposes: {
        './Content': './src/components/Content.vue',
        './Button': './src/components/Button.js',
        './UnusedButton': './src/components/UnusedButton.vue',
      },
      shared: ["vue","vuex"]
    })
  ],
  build: {
    target:'es2020',
    minify: false,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        minifyInternalExports: false
      }
    }
  }
})
