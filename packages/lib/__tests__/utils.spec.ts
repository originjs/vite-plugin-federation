import { sharedAssign, parseOptions } from '../src/utils'
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
