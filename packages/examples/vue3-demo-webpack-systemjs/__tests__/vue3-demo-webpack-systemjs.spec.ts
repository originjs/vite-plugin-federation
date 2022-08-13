import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('Webpack Component', async () => {
  expect(
    await page.textContent('#btn-primary')
  ).toBe('Webpack Component')
})

test('Webpack Content', async () => {
  expect(
    await page.textContent('#webpack-content')
  ).toBe('Webpack Content')
})

