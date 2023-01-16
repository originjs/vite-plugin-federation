import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'

// Comment because there is no good solution for the time being
test.skip('should have no 404s', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test.skip('remote button', async () => {
  expect(
    await page.textContent('#btn-remote')
  ).toBe("remote-simple's Button: 0")
})
