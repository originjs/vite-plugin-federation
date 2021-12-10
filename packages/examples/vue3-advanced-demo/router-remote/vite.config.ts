import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from "@originjs/vite-plugin-federation";
import ElementPlus from 'unplugin-element-plus/vite'

// https://vitejs.dev/config/
export default defineConfig({
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
        })
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
})
