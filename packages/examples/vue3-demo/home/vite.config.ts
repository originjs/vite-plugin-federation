import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "home",
      filename: "remoteEntry.js",
      exposes: {
        "./Content": "./src/components/Content.vue",
        "./Button": "./src/components/Button.js",
      },
      shared: ["vue"]
    })
  ],
  build: {
    minify: false
  }
});
