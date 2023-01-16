import { browserLogs, page } from '~utils'
import { expect, test } from 'vitest'
// Using webpack components in vite
test('should have no 404s in vite part', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('Webpack Content', async () => {
  expect(
    await page.textContent('#webpack-content')
  ).toBe('Webpack Content')
})

test('Webpack Button', async () => {
  expect(
    await page.textContent('#webpack-button')
  ).toBe('Webpack Button')
})

// Using vite components webpack

test('should have no 404s in webpack part', () => {
  browserLogs.forEach((msg) => {
    expect(msg).not.toMatch('404')
  })
})

test('Vite Button', async () => {
  await page.goto('127.0.0.1:5001')
  expect(
    await page.textContent('#vite-button')
  ).toBe('Vite Button')
})
