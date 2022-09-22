import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from "@originjs/vite-plugin-federation"
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ElementPlus(),
    vue(),
    federation({
      name: 'team-blue',
      filename: 'remoteEntry.js',
      exposes: {
          './BasketInfo': './src/components/BasketInfo.vue',
          './BuyButton': './src/components/BuyButton.vue',
      },
      shared: ['vue']
    })
  ],
  build: {
    minify: false,
    target: ["chrome89", "edge89", "firefox89", "safari15"]
 }
})
