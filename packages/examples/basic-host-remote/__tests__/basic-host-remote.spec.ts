

test('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

// describe('asset imports from js', () => {
//   test('file outside root', async () => {
//     expect(
//       await page.textContent('.asset-reference.outside-root .asset-url')
//     ).toMatch(outerAssetMatch)
//   })
// })

