import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
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
            shared: ['vue', 'pinia']
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
