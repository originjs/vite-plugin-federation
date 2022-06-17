import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@dilesoft/vite-plugin-federation-dynamic'

// https://vitejs.dev/config/
export default defineConfig({
    cacheDir: 'node_modules/.cacheDir',
    plugins: [
        vue(),
        federation({
            name: 'layout',
            filename: 'remoteEntry.js',
            remotes: {
                home: {
                    external: 'http://localhost:5001/remoteEntry.js',
                    format: 'var'
                }
            },
            shared: ['vue', 'vuex']
        })
    ],
    build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                format: 'esm',
                entryFileNames: 'assets/[name].js',
                minifyInternalExports: false
            }
        }
    }
})
