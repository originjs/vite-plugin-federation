import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('remote button', async () => {
  expect(
    await page.textContent('.remote-btn')
  ).toBe('Button from remote')
})

