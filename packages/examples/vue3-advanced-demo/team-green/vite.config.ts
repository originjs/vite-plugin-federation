import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin(),
    federation({
      name: 'team-green',
      filename: 'remoteEntry.js',
      exposes: {
          './Recommendations': './src/components/Recommendations.vue',
      },
      shared: ['vue', 'pinia']
    })
  ],
  base: 'http://localhost:5003',
  build: {
    minify: false,
    target: ["chrome89", "edge89", "firefox89", "safari15"]
 }
})
