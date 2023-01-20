import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('remote-count', async () => {
  expect(
    await page.textContent('#store-count')
  ).toBe(' count:1')
})

test('button', async () => {
  expect(
      await page.textContent('#store-button')
  ).toBe('increase:1')
})


