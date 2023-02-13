import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: ['./src/index.ts', 'src/utils/semver/satisfy.ts'],
      formats: ['es', 'cjs']
    },
    target: 'node14',
    minify: false,
    rollupOptions: {
      external: ['fs', 'path', 'crypto', 'magic-string'],
      output: {
        minifyInternalExports: false
      }
    }
  }
})
