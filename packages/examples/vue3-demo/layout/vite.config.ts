import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    federation({
      name: "layout",
      filename: "remoteEntry.js",
      remotes: {
        home: "http://localhost:3002/remoteEntry.js",
      },
      shared:["vue"]
    })
  ],
  build: {
    minify: false
  }
});
