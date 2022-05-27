import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from "@dilesoft/vite-plugin-federation-dynamic";
import ElementPlus from 'unplugin-element-plus/vite'
import copy from 'rollup-plugin-copy'
import { createHtmlPlugin } from 'vite-plugin-html'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    const root = process.cwd()

    const env = loadEnv(mode, root)
    console.log(env);
    return {
        plugins: [
            // @rollup/plugin-replace 无法对打包后的代码进行 replace
            // replace({
            //     'createBaseVNode,': 'createBaseVNode,createBaseVNode as createElementVNode'
            // }),

            // @rollup/plugin-legacy 针对源码生成导出的，非本场景

            ElementPlus(),
            vue(),
            federation({
                name: 'router-remote',
                filename: 'remoteEntry.js',
                exposes: {
                    './ElementPlus': './src/components/ElementPlus.vue',
                    './ElSubMenuDashboard': './src/components/ElSubMenuDashboard.vue',
                    './Login': './src/views/Login.vue',
                    './Footer': './src/components/Footer.vue',
                    './Header': './src/components/Header.vue',
                    './ProductList': './src/components/ProductList.vue',
                    './ShoppingCart': './src/components/ShoppingCart.vue'
                },
                shared: ["vue", "vue-router", "element-plus", "vuex"]
            }),
            createHtmlPlugin({
                inject: {
                    // Inject data into ejs template
                    data: {
                        title: env.VITE_APP_TITLE,
                    },
                },
            }),
            copy({
                targets: [
                    {
                        src: 'dist/assets',
                        dest: 'public',
                    },
                ],
                hook: 'writeBundle', // notice here
            }),
        ],
        build: {
            polyfillModulePreload: false,
            assetsInlineLimit: 40960,
            target: 'esnext',
            minify: false,
            cssCodeSplit: false,
            rollupOptions: {
                // external: ["vue"],
                output: {
                    minifyInternalExports: false
                }
            }
        }
    }
})
