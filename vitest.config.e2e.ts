import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

const timeout = process.env.CI ? 50000 : 30000

export default defineConfig({
  resolve: {
    alias: {
      '~utils': resolve(__dirname, './packages/examples/testUtils')
    }
  },
  test: {
    threads: false,
    include: ['./packages/examples/**/*.spec.[tj]s'],
    setupFiles: ['./packages/examples/vitestSetup.ts'],
    globalSetup: ['./packages/examples/vitestGlobalSetup.ts'],
    testTimeout: timeout,
    hookTimeout: timeout,
    globals: true,
    reporters: 'default',
    onConsoleLog(log) {
      if (log.match(/experimental|jit engine|emitted file|tailwind/i))
        return false
    }
  },
  esbuild: {
    target: 'node18'
  }
})
