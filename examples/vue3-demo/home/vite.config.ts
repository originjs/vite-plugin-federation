import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  // optimizeDeps: {
  //   exclude: ["foo_app1", "foo_rollup_spa"],
  // },
  plugins: [
    vue(),
    federation({
      name: "home",
      filename: "remoteEntry.js",
      
      exposes: {
        "./Content": "./src/components/Content.vue",
        "./Button": "./src/components/Button.js",
      },
    })
  ],
  build: {
    minify: false,
    rollupOptions: {
      output: {
        manualChunks: { vue: ['vue'] }
      }
    }
  }
});
