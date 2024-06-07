import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('shared state', async () => {
  expect(
    await page.textContent('h1')
  ).toBe('0 around here ...')

  await page.click('button');

  expect(
      await page.textContent('h1')
  ).toBe('1 around here ...')
})
