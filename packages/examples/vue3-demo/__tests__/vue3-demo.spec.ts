

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('remote button', async () => {
  expect(
    await page.textContent('#btn-remote')
  ).toBe('Hello Remote Button')
})

test('check vuex data', async () => {
  expect(
    await page.textContent('#cart-item')
  ).toBe('items: 5')
})

