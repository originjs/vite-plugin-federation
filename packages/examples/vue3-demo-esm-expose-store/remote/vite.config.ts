import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        federation({
            name: 'home',
            filename: 'remoteEntry.js',
            exposes: {
                './Button': './src/components/Button.vue',
                './remoteStore':'./src/store.js'
            },
            shared: {
                vue: {},
                pinia: {}
            }
        }),
        // topLevelAwait({
        //     // The export name of top-level await promise for each chunk module
        //     promiseExportName: "__tla",
        //     // The function to generate import names of top-level await promise in each chunk module
        //     promiseImportName: i => `__tla_${i}`
        // })
    ],
    build: {
        target:'esnext',
        assetsInlineLimit: 40960,
        minify: false,
        cssCodeSplit: false,
        sourcemap: true,
        rollupOptions: {
            output: {
                minifyInternalExports: false
            }
        }
    }
})
