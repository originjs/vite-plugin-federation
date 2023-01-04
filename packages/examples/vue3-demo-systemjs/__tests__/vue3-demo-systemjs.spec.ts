import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('layout button', async () => {
  expect(
    await page.textContent('#btn-layout')
  ).toBe('Hello Layout Button')

})

test('remote button', async () => {
  expect(
    await page.textContent('#btn-remote')
  ).toBe('Hello Remote Button')
})

test('check pinia data', async () => {
  expect(
    await page.textContent('#cart-item')
  ).toBe('cartItems from pinia: 5')
})

