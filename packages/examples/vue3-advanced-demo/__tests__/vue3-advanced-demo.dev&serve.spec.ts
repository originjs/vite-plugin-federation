import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('Reacted Products', async () => {
  expect(
    await page.textContent('#reco>h3')
  ).toBe('Related Products')
})

test('buy', async () => {
  expect(
    await page.textContent('#buy>button')
  ).toBe(' buy for 66,00 €')
})

test('baskets', async () => {
  expect(
      await page.textContent('#basket>div')
  ).toBe("basket: 0 item(s)")
})
