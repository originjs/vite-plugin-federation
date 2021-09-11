import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: 'common-lib',
      filename: 'remoteEntry.js',
      exposes: {
        './CommonCounter': './src/components/CommonCounter.vue',
        './CommonHeader': './src/components/CommonHeader.vue'
      },
      shared: {
        vue: {
          requiredVersion:'^1.0.0'
        }
      }
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
