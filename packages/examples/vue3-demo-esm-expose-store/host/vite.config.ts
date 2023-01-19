import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from '@originjs/vite-plugin-federation'

// https://vitejs.dev/config/
export default defineConfig({
    server: {
    },
    plugins: [
        vue(),
        federation({
            name: 'layout',
            filename: 'remoteEntry.js',
            remotes: {
                "remote-store": "http://localhost:5001/assets/remoteEntry.js"
            },
            shared: {
                vue:{
                    // This is an invalid configuration, because the generate attribute is not supported on the host side
                    generate:false
                },
                pinia:{
                }

            }
        })
    ],
    build: {
        target: 'esnext',
        minify: false,
        cssCodeSplit: true,
        rollupOptions: {
            output: {
                minifyInternalExports: false
            }
        }
    }
})
