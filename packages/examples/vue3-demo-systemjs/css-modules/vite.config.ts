import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'
import autoprefixer from 'autoprefixer'

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
      shared: ['vue']
    })
  ],
  build: {
    target: 'esnext',
    minify: true,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        format: 'system',
        minifyInternalExports: false
      }
    }
  }
})
