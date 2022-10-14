import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('remote button', async () => {
  expect(
    await page.textContent('#btn-remote')
  ).toBe('Hello Layout Button')
})

test('check pinia data', async () => {
  expect(
    await page.textContent('#cart-item')
  ).toBe('cartItems from pinia: 5')
})

