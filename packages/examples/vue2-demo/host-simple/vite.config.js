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
        'remote-simple': 'http://localhost:5001/remoteEntry.js'
      },
      shared: ['vue']
    })
  ],
  // Dependencies that are forcibly excluded in a pre-build
  optimizeDeps: {
    // ...
    // 抓取预构建的依赖项的入口点，指定自定义条目——该值需要遵循 fast-glob 模式 ，或者是相对于 vite 项目根的模式数组。这将覆盖掉默认条目推断。
    // 无法抓取远程入口
    // entries: ['index.html','http://localhost:5011/remoteEntry.js'],
    // exclude: ['remote-simple'],
    // exclude: ['remote-simple/*'],
    // exclude: ['remote-simple', 'remote-simple/remote-simple-button','remote-simple/remote-simple-section'],
    exclude: ['exclude-simple']
  },
  server: {force: true},
  build: {
    target: 'es2020',
    minify: false,
    cssCodeSplit: true,
    rollupOptions: {
      // sharedPlugin need input required
      // input:{},
      output: {
        minifyInternalExports: false
      }
    }
  }
})
