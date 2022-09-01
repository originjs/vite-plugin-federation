import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    // host: "192.168.56.1",
    // port: 5100
  },
  cacheDir: 'node_modules/.cacheDir',
  plugins: [
    vue(),
    federation({
      name: 'layout',
      filename: 'remoteEntry.js',
      remotes: {
        home: 'http://localhost:5001/assets/remoteEntry.js',
        'common-lib': 'http://localhost:5002/assets/remoteEntry.js',
        'css-modules': 'http://localhost:5003/assets/remoteEntry.js'
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
