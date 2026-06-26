import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('remote button', async () => {
  expect(
    await page.textContent('.remote-button')
  ).toContain('Remote Button')
})

test('check pinia store', async () => {
  expect(
    await page.textContent('.remote-button')
  ).toContain('Clicked 0 times')

  await page.click('.remote-button')
  expect(
    await page.textContent('.remote-button')
  ).toContain('Clicked 1 times')
})