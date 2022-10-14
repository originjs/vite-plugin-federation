import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: 'node_modules/.cacheDir',
  plugins: [
    vue(),
    federation({
      name: 'layout',
      filename: 'remoteEntry.js',
      remotes: {
        home: 'http://localhost:5001/remoteEntry.js'
      },
      shared: ['vue', 'pinia']
    })
  ],
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        format: 'system',
        entryFileNames: 'assets/[name].js',
        minifyInternalExports: false
      }
    }
  }
})
