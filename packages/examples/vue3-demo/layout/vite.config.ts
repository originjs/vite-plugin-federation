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
        home: "http://localhost:5001/remoteEntry.js",
        "common-lib": "http://localhost:5002/remoteEntry.js",
        "css-modules":"http://localhost:5003/remoteEntry.js"
      },
      shared: ["vue"]
    })
  ],
  build: {
    target:'es2020',
    minify: false,
    cssCodeSplit: true,
    rollupOptions:{
      output:{
        minifyInternalExports:false
      }
    }
  },
});