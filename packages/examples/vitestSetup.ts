import { execa } from 'execa';
import { dirname, join, resolve } from 'node:path'
import os from 'node:os'
import fs from 'fs-extra'
import { chromium } from 'playwright-chromium'
import type { Browser, Page } from 'playwright-chromium'
import type { File } from 'vitest'
import { beforeAll, afterAll } from 'vitest'

export const workspaceRoot = resolve(__dirname, '../')
/**
 * Path to the test folder
 */
export let testDir: string

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

export const browserLogs: string[] = []
export const browserErrors: Error[] = []

export let page: Page = undefined!
export let browser: Browser = undefined!
export let viteTestUrl: string = ''

const DIR = join(os.tmpdir(), 'vitest_playwright_global_setup')

let err: Error
let skipError: boolean

beforeAll(async (s) => {
  process.env.NODE_ENV = 'production'
  const suite = s as File
  // skip browser setup for non-examples tests
  if (!suite.filepath.includes('examples')) {
    return
  }

  const wsEndpoint = fs.readFileSync(join(DIR, 'wsEndpoint'), 'utf-8')
  if (!wsEndpoint) {
    throw new Error('wsEndpoint not found')
  }

  browser = await chromium.connect(wsEndpoint)
  page = await browser.newPage()

  const globalConsole = global.console
  const warn = globalConsole.warn
  globalConsole.warn = (msg, ...args) => {
    // suppress @vue/reactivity-transform warning
    if (msg.includes('@vue/reactivity-transform')) return
    warn.call(globalConsole, msg, ...args)
  }

  skipError = false
  try {
    page.on('console', (msg) => {
      browserLogs.push(msg.text())
    })
    page.on('pageerror', (error) => {
      browserErrors.push(error)
    })

    const testPath = suite.filepath!
    const testName = slash(testPath).match(
      /packages\/examples\/([\w-]+)\//
    )?.[1]
    testDir = dirname(testPath)


    // if this is a test placed under examples/xxx/__tests__
    // start a vite server in that directory.
    if (testName) {
      testDir = resolve(workspaceRoot, 'temp', testName)
      if (testName === 'vue2-demo') {
        await execa('pnpm', ['install'], {
          cwd: testDir,
          stdio: 'inherit'
        })
      }
      execa('pnpm', ['run', 'serve'], { cwd: testDir, stdio: 'inherit' })
      await execa('pnpm', ['run', 'build'], { cwd: testDir, stdio: 'inherit' })

      const port = 5000
      // use resolved port/base from server
      viteTestUrl = `http://localhost:${port}`
      await page.goto(viteTestUrl)
    }
  } catch (e) {
    // jest doesn't exit if our setup has error here
    // https://github.com/facebook/jest/issues/2713
    if (!skipError) {
      err = e
    }
    // Closing the page since an error in the setup, for example a runtime error
    // when building the playground should skip further tests.
    // If the page remains open, a command like `await page.click(...)` produces
    // a timeout with an exception that hides the real error in the console.
    await page.close()
  }
}, 60000)

afterAll(async () => {
  await page?.close()
  skipError = true
  await execa('pnpm', ['run', 'stop'], { cwd: testDir, stdio: 'inherit' })
  if (browser) {
    await browser.close()
  }
  if (err) {
    throw err
  }
})
