import os from 'node:os'
import path from 'node:path'
import fs from 'fs-extra'
import kill from 'kill-port'
import type { BrowserServer } from 'playwright-chromium'
import { chromium } from 'playwright-chromium'

const DIR = path.join(os.tmpdir(), 'vitest_playwright_global_setup')

let browserServer: BrowserServer | undefined

export async function setup(): Promise<void> {
  browserServer = await chromium.launchServer({
    headless: !process.env.VITE_DEBUG_SERVE,
    args: process.env.CI
      ? ['--no-sandbox', '--disable-setuid-sandbox']
      : undefined
  })

  await fs.mkdirp(DIR)
  await fs.writeFile(path.join(DIR, 'wsEndpoint'), browserServer.wsEndpoint())

  const tempDir = path.resolve(__dirname, '../temp')
  await fs.ensureDir(tempDir)
  await fs.emptyDir(tempDir)
  await fs
    .copy(path.resolve(__dirname, '../examples'), tempDir, {
      dereference: false,
      filter(file) {
        file = file.replace(/\\/g, '/')
        return !file.includes('__tests__') && !file.match(/dist(\/|$)/)
      }
    })
    .catch(async (error) => {
      if (error.code === 'EPERM' && error.syscall === 'symlink') {
        throw new Error(
          'Could not create symlinks. On Windows, consider activating Developer Mode to allow non-admin users to create symlinks by following the instructions at https://docs.microsoft.com/en-us/windows/apps/get-started/enable-your-device-for-development.'
        )
      } else {
        throw error
      }
    })
}

export async function teardown(): Promise<void> {
  browserServer?.close()
  if (!process.env.VITE_PRESERVE_BUILD_ARTIFACTS) {
    await fs.remove(path.resolve(__dirname, '../temp'), (err) => {
      if (err) return console.log(err)
      console.log('temp file is deleted')
    })
    kill('5000,5001,5002,5003').catch(console.log)
  }
}
