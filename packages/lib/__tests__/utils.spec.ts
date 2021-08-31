import { sharedAssign, parseOptions, isSameFilepath } from '../src/utils'
import { ExposesObject } from '../types'

test('objectUtil', () => {
  expect(sharedAssign).toBeDefined()
})

test('parse exposes options', () => {
  const normalizeSimple = (item) => ({
    import: item,
    name: undefined
  })
  const normalizeOptions = (item) => ({
    import: item.import,
    name: item.name || undefined
  })
  // string[]
  let exposes: (string | ExposesObject)[] | ExposesObject = [
    './src/components/Content.vue',
    './src/components/Button.js'
  ]
  let ret = parseOptions(exposes, normalizeSimple, normalizeOptions)
  expect(ret[0]).toMatchObject([
    './src/components/Content.vue',
    { import: './src/components/Content.vue' }
  ])
  expect(ret[1]).toMatchObject([
    './src/components/Button.js',
    { import: './src/components/Button.js' }
  ])
  // ExposesObject
  exposes = {
    './Content': './src/components/Content.vue',
    './Button': './src/components/Button.js'
  }
  ret = parseOptions(exposes, normalizeSimple, normalizeOptions)
  expect(ret[0]).toMatchObject([
    './Content',
    { import: './src/components/Content.vue' }
  ])
  expect(ret[1]).toMatchObject([
    './Button',
    { import: './src/components/Button.js' }
  ])

  exposes = {
    './Content': {
      import: './src/components/Content.vue',
      name: 'content'
    },
    './Button': {
      import: './src/components/Button.js',
      name: 'button'
    }
  }
  ret = parseOptions(exposes, normalizeSimple, normalizeOptions)
  expect(ret[0]).toMatchObject([
    './Content',
    { import: './src/components/Content.vue', name: 'content' }
  ])
  expect(ret[1]).toMatchObject([
    './Button',
    { import: './src/components/Button.js', name: 'button' }
  ])
  // console.log(JSON.stringify(ret))

  // ExposesObject[]
  exposes = [
    { Content: './src/components/Content.vue' },
    { Button: './src/components/Button.js' }
  ]
  ret = parseOptions(exposes, normalizeSimple, normalizeOptions)
  expect(ret[0]).toMatchObject([
    'Content',
    { import: './src/components/Content.vue' }
  ])
  expect(ret[1]).toMatchObject([
    'Button',
    { import: './src/components/Button.js' }
  ])
})

test('isSameFilepath', () => {
  // exactly the same
  expect(
    isSameFilepath(
      'D:\\federation-test\\src\\button.js',
      'D:\\federation-test\\src\\button.js'
    )
  ).toBe(true)

  // different separator
  expect(
    isSameFilepath(
      'D:/federation-test/src/button.js',
      'D:\\federation-test\\src\\button.js'
    )
  ).toBe(true)

  // ignore file suffix
  expect(
    isSameFilepath(
      'D:/federation-test/src/button',
      'D:\\federation-test\\src\\button.js'
    )
  ).toBe(true)
  expect(
    isSameFilepath(
      'D:/federation-test/src/button.vue',
      'D:\\federation-test\\src\\button'
    )
  ).toBe(true)
  expect(
    isSameFilepath('D:/origin.js/src/button.vue', 'D:\\origin.js\\src\\button')
  ).toBe(true)
  expect(
    isSameFilepath(
      'D:/origin.js/src/button.vue',
      'D:\\origin.js\\src\\button.js'
    )
  ).toBe(false)

  // relative path
  expect(isSameFilepath('D:/origin.js/src/button.vue', 'src/button.vue')).toBe(
    false
  )

  // similar file path
  expect(
    isSameFilepath(
      'D:\\origin.js\\src\\button.js',
      'D:\\origin.js\\src\\button1.js'
    )
  ).toBe(false)
  expect(
    isSameFilepath(
      'D:/federation-test/src/button.vue',
      'D:/federation-test/src/button1'
    )
  ).toBe(false)
  expect(
    isSameFilepath('D:\\origin.js\\src\\button', 'D:\\origin.js\\src\\button1')
  ).toBe(false)
})
