import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('remote A', async () => {
  expect(
    await page.textContent('#remoteA')
  ).toBe('increase')
})

test('remote B', async () => {
  expect(
    await page.textContent('#remoteB')
  ).toBe('increase')
})

