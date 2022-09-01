import {defineConfig, loadEnv} from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";
import {createHtmlPlugin} from 'vite-plugin-html'
// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
    const root = process.cwd()

    const env = loadEnv(mode, root)
    return {
        plugins: [
            vue(),
            federation({
                name: "router-host",
                filename: "remoteEntry.js",
                remotes: {
                    "router-remote": {
                        external: "http://localhost:5005/assets/remoteEntry.js",
                        format: 'esm',
                        from: 'vite'
                    },
                },
                shared: ["vue", "vue-router", "element-plus", "pinia"]
            }),
            createHtmlPlugin({
                inject: {
                    // Inject data into ejs template
                    data: {
                        title: env.VITE_APP_TITLE,
                    },
                },
            }),
        ],
        // optimizeDeps:{
        //     include: ["element-plus"]
        // },

        // 解决 const Home = {template: '<p>Home</p>'} 类组件无法在 vue-router 中显示的问题
        resolve: {
            alias: {
                vue: 'vue/dist/vue.esm-bundler.js',
                'vue-router': 'vue-router/dist/vue-router.esm-bundler.js'
            }
        },
        build: {
            target: 'esnext',
            minify: false,
            cssCodeSplit: true,
            rollupOptions: {
                output: {
                    minifyInternalExports: false
                }
            }
        },
    }
})
