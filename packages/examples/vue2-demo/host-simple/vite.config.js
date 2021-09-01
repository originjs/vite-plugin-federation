import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    createVuePlugin(),
    federation({
      name: 'remote-simple',
      filename: 'remoteEntry.js',
      remotes: {
        'remote-simple': 'http://localhost:5011/remoteEntry.js'
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
