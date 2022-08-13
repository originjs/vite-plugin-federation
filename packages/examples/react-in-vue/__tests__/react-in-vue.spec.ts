import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test.skip('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test.skip('remote button', async () => {
  expect(
    await page.textContent('.remote-btn')
  ).toBe('React Button in vue')
})

