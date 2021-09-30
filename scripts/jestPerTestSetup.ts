import fs from 'fs-extra'
import { resolve } from 'path'
import execa from 'execa'
import { Page } from 'playwright-chromium'

export function slash(p: string): string {
  return p.replace(/\\/g, '/')
}

// injected by the test env
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      page?: Page
      viteTestUrl?: string
    }
  }
}

let rootDir: string
let err: Error
let skipError: boolean

const logs: string[] = ((global as any).browserLogs = [])
const onConsole = (msg) => {
  logs.push(msg.text())
}

beforeAll(async () => {
  const page = global.page
  if (!page) {
    return
  }
  skipError = false
  try {
    page.on('console', onConsole)

    const testPath = expect.getState().testPath
    const testName = slash(testPath).match(
      /packages\/examples\/([\w-]+)\//
    )?.[1]

    // if this is a test placed under examples/xxx/__tests__
    // start a vite server in that directory.
    if (testName) {
      const playgroundRoot = resolve(__dirname, '../packages/examples')
      const srcDir = resolve(playgroundRoot, testName)
      rootDir = resolve(__dirname, '../temp/example', testName)
      await fs.copy(srcDir, rootDir, {
        dereference: true,
        filter(file) {
          file = slash(file)
          return (
            !file.includes('__tests__') &&
            !file.includes('node_modules') &&
            !file.match(/dist(\/|$)/)
          )
        }
      })
      if (testName === 'vue2-demo') {
        await execa('yarn', { cwd: rootDir, stdio: 'inherit' })
      }
      execa('yarn', ['serve'], { cwd: rootDir, stdio: 'inherit' })
      await execa('yarn', ['build'], { cwd: rootDir, stdio: 'inherit' })

      const port = 5000
      // use resolved port/base from server
      const url = (global.viteTestUrl = `http://localhost:${port}`)
      await page.goto(url)
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
  global.page?.off('console', onConsole)
  await global.page?.close()
  skipError = true
  await execa('yarn', ['stop'], { cwd: rootDir, stdio: 'inherit' })

  if (err) {
    throw err
  }
})
