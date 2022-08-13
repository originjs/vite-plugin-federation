import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      './packages/examples/**/*.*',
      './packages/temp/**/*.*'
    ],
    testTimeout: 20000
  },
  esbuild: {
    target: 'node14'
  }
})
