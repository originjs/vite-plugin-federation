// *****************************************************************************
// Copyright (C) 2022 Origin.js and others.
//
// This program and the accompanying materials are licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//          http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
// EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
// MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
//
// SPDX-License-Identifier: MulanPSL-2.0
// *****************************************************************************

import {
  getModuleMarker,
  isSameFilepath,
  parseOptions,
  removeNonRegLetter
} from '../src/utils'
import type { ExposesObject } from '../types'
import { expect, test } from 'vitest'

test('remove nonLetter', () => {
  const includeUnderline = 'user_name'
  const includeDash = 'user-name'
  const all = 'U"s-e@r#n$a%m^e&*(),./;[]{}'
  const fileNameReg = new RegExp('[0-9a-zA-Z@_-]+')
  expect(removeNonRegLetter(includeUnderline)).toMatch('userName')
  expect(removeNonRegLetter(includeDash)).toMatch('userName')
  expect(removeNonRegLetter(all)).toMatch('USERNAME')
  expect(removeNonRegLetter(includeUnderline, fileNameReg)).toMatch('user_name')
  expect(removeNonRegLetter(includeDash, fileNameReg)).toMatch('user-name')
  expect(removeNonRegLetter(all, fileNameReg)).toMatch('US-e@rNAME')
})

test('get moduleMarker', () => {
  expect('__rf_placeholder__test').toMatch(getModuleMarker('test'))
  expect('__rf_type__test').toMatch(getModuleMarker('test', 'type'))
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

  //  shared array
  expect(
    parseOptions(
      ['vue', 'react', 'react-dom'],
      (item) => ({
        import: item
      }),
      (item) => item
    )
  ).toMatchObject([
    ['vue', { import: 'vue' }],
    ['react', { import: 'react' }],
    ['react-dom', { import: 'react-dom' }]
  ])

  // sharedObject
  expect(
    parseOptions(
      {
        vue: { requiredVersion: '3.1.1' },
        react: { requiredVersion: '16.1.0' }
      },
      (item) => ({
        import: item
      }),
      (item) => item
    )
  ).toMatchObject([
    ['vue', { requiredVersion: '3.1.1' }],
    ['react', { requiredVersion: '16.1.0' }]
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
