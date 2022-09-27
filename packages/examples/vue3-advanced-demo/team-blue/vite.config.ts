import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    ElementPlus(),
    cssInjectedByJsPlugin(),
    vue(),
    federation({
      name: 'team-blue',
      filename: 'remoteEntry.js',
      exposes: {
          './BasketInfo': './src/components/BasketInfo.vue',
          './BuyButton': './src/components/BuyButton.vue',
      },
      shared: ['vue', 'pinia']
    })
  ],
  build: {
    minify: false,
    target: ["chrome89", "edge89", "firefox89", "safari15"]
 }
})
