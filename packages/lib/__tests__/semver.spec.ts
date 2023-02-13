// test cases from https://devhints.io/semver
import { describe, expect, test } from 'vitest'
import { satisfy } from '../src/utils/semver/satisfy'

const version = '1.2.3'
const belowVersion = '1.2.2'
const aboveVersion = '1.2.4'
const tildeMaxVersion = '1.3.0'
const caretMaxVersion = '2.0.0'

const tilde = '~1.2.3'
const specialTilde1 = '~1.2'
const specialTilde2 = '~1'

const caret = '^1.2.3'
const specialCaret1 = '^0.2.3'
const specialCaret2 = '^0.0.1'
const specialCaret3 = '^1.2'
const specialCaret4 = '^1'

const xRange = '1'
const xRange1 = '*'
const xRange2 = 'x'
const specialXRange1 = '1.x'
const specialXRange2 = '1.*'

describe('satisfy ranges', () => {
  test('tilde', () => {
    expect(satisfy(version, tilde)).toBe(true)
    expect(satisfy(belowVersion, tilde)).toBe(false)
    expect(satisfy(aboveVersion, tilde)).toBe(true)
    expect(satisfy(tildeMaxVersion, tilde)).toBe(false)
  })

  describe('special tilde', () => {
    test('special tilde 1', () => {
      expect(satisfy('1.2.0', specialTilde1)).toBe(true)
      expect(satisfy('1.2.4', specialTilde1)).toBe(true)
      expect(satisfy('1.1.9', specialTilde1)).toBe(false)
      expect(satisfy('1.3.0', specialTilde1)).toBe(false)
    })

    test('special tilde 2', () => {
      expect(satisfy('1.0.0', specialTilde2)).toBe(true)
      expect(satisfy('0.0.9', specialTilde2)).toBe(false)
      expect(satisfy('1.3.0', specialTilde2)).toBe(true)
      expect(satisfy('2.0.0', specialTilde2)).toBe(false)
    })
  })

  test('caret', () => {
    expect(satisfy(version, caret)).toBe(true)
    expect(satisfy(belowVersion, caret)).toBe(false)
    expect(satisfy(aboveVersion, caret)).toBe(true)
    expect(satisfy(caretMaxVersion, caret)).toBe(false)
  })

  describe('special caret', () => {
    test('special caret 1', () => {
      expect(satisfy('0.2.3', specialCaret1)).toBe(true)
      expect(satisfy('0.2.2', specialCaret1)).toBe(false)
      expect(satisfy('0.2.5', specialCaret1)).toBe(true)
      expect(satisfy('0.3.0', specialCaret1)).toBe(false)
    })

    test('special caret 2', () => {
      expect(satisfy('0.0.1', specialCaret2)).toBe(true)
      expect(satisfy('0.0.0', specialCaret2)).toBe(false)
      expect(satisfy('0.0.2', specialCaret2)).toBe(false)
    })

    test('special caret 3', () => {
      expect(satisfy('1.2.0', specialCaret3)).toBe(true)
      expect(satisfy('1.3.3', specialCaret3)).toBe(true)
      expect(satisfy('1.1.9', specialCaret3)).toBe(false)
      expect(satisfy('2.0.0', specialCaret3)).toBe(false)
    })

    test('special caret 4', () => {
      expect(satisfy('1.0.0', specialCaret4)).toBe(true)
      expect(satisfy('0.0.9', specialCaret4)).toBe(false)
      expect(satisfy('1.3.0', specialCaret4)).toBe(true)
      expect(satisfy('2.0.0', specialCaret4)).toBe(false)
    })
  })

  describe('x ranges', () => {
    test('x range', () => {
      expect(satisfy('1.0.0', xRange)).toBe(true)
      expect(satisfy('0.0.9', xRange)).toBe(false)
      expect(satisfy('1.3.0', xRange)).toBe(true)
      expect(satisfy('2.0.0', xRange)).toBe(false)
    })

    test('x range 1', () => {
      expect(satisfy('1.0.0', xRange1)).toBe(true)
      expect(satisfy('0.0.9', xRange1)).toBe(true)
      expect(satisfy('1.3.0', xRange1)).toBe(true)
      expect(satisfy('2.0.0', xRange1)).toBe(true)
    })

    test('x range 2', () => {
      expect(satisfy('1.0.0', xRange2)).toBe(true)
      expect(satisfy('0.0.9', xRange2)).toBe(true)
      expect(satisfy('1.3.0', xRange2)).toBe(true)
      expect(satisfy('2.0.0', xRange2)).toBe(true)
    })
  })

  describe('special x range', () => {
    test('special x range 1', () => {
      expect(satisfy('1.0.0', specialXRange1)).toBe(true)
      expect(satisfy('0.0.9', specialXRange1)).toBe(false)
      expect(satisfy('1.3.0', specialXRange1)).toBe(true)
      expect(satisfy('2.0.0', specialXRange1)).toBe(false)
    })

    test('special x range 2', () => {
      expect(satisfy('1.0.0', specialXRange2)).toBe(true)
      expect(satisfy('0.0.9', specialXRange2)).toBe(false)
      expect(satisfy('1.3.0', specialXRange2)).toBe(true)
      expect(satisfy('2.0.0', specialXRange2)).toBe(false)
    })
  })
})

describe('simple ranges', () => {
  test('empty operator', () => {
    expect(satisfy('1.2.3', '1.2.3')).toBe(true)
    expect(satisfy('1.2.2', '1.2.3')).toBe(false)
    expect(satisfy('1.2.4', '1.2.3')).toBe(false)
  })

  test('= operator', () => {
    expect(satisfy('1.2.3', '=1.2.3')).toBe(true)
    expect(satisfy('1.2.2', '=1.2.3')).toBe(false)
    expect(satisfy('1.2.4', '=1.2.3')).toBe(false)
  })

  test('> operator', () => {
    expect(satisfy('1.2.3', '>1.2.3')).toBe(false)
    expect(satisfy('1.2.2', '>1.2.3')).toBe(false)
    expect(satisfy('1.2.4', '>1.2.3')).toBe(true)
  })

  test('< operator', () => {
    expect(satisfy('1.2.3', '<1.2.3')).toBe(false)
    expect(satisfy('1.2.2', '<1.2.3')).toBe(true)
    expect(satisfy('1.2.4', '<1.2.3')).toBe(false)
  })

  test('>= operator', () => {
    expect(satisfy('1.2.3', '>=1.2.3')).toBe(true)
    expect(satisfy('1.2.2', '>=1.2.3')).toBe(false)
    expect(satisfy('1.2.4', '>=1.2.3')).toBe(true)
  })

  test('<= operator', () => {
    expect(satisfy('1.2.3', '<=1.2.3')).toBe(true)
    expect(satisfy('1.2.2', '<=1.2.3')).toBe(true)
    expect(satisfy('1.2.4', '<=1.2.3')).toBe(false)
  })
})

describe('hyphenated ranges', () => {
  test('normal hyphen', () => {
    expect(satisfy('1.2.3', '1.2.3 - 2.3.4')).toBe(true)
    expect(satisfy('1.2.2', '1.2.3 - 2.3.4')).toBe(false)
    expect(satisfy('1.3.3', '1.2.3 - 2.3.4')).toBe(true)
    expect(satisfy('2.3.4', '1.2.3 - 2.3.4')).toBe(true)
    expect(satisfy('2.3.5', '1.2.3 - 2.3.4')).toBe(false)
  })

  test('partial right hyphen', () => {
    expect(satisfy('1.2.3', '1.2.3 - 2.3')).toBe(true)
    expect(satisfy('1.2.2', '1.2.3 - 2.3')).toBe(false)
    expect(satisfy('1.3.3', '1.2.3 - 2.3')).toBe(true)
    expect(satisfy('2.3.9', '1.2.3 - 2.3')).toBe(true)
    expect(satisfy('2.4.0', '1.2.3 - 2.3')).toBe(false)

    expect(satisfy('1.2.3', '1.2.3 - 2')).toBe(true)
    expect(satisfy('1.2.2', '1.2.3 - 2')).toBe(false)
    expect(satisfy('1.3.3', '1.2.3 - 2')).toBe(true)
    expect(satisfy('2.9.9', '1.2.3 - 2')).toBe(true)
    expect(satisfy('3.0.0', '1.2.3 - 2')).toBe(false)
  })

  test('partial left hyphen', () => {
    expect(satisfy('1.2.0', '1.2 - 2.3.0')).toBe(true)
    expect(satisfy('1.1.0', '1.2 - 2.3.0')).toBe(false)
    expect(satisfy('1.2.2', '1.2 - 2.3.0')).toBe(true)
    expect(satisfy('1.3.3', '1.2 - 2.3.0')).toBe(true)
    expect(satisfy('2.3.0', '1.2 - 2.3.0')).toBe(true)
    expect(satisfy('2.4.0', '1.2 - 2.3.0')).toBe(false)
  })
})

describe('pre-release', () => {
  test('fixed version', () => {
    expect(satisfy('1.2.3-prerelease+build', '1.2.3-prerelease+build')).toBe(
      true
    )
    expect(satisfy('1.2.3-prerelease', '1.2.3-prerelease+build')).toBe(true)
    expect(satisfy('4.0.0', '4.0.0-alpha.57')).toBe(false)
    expect(satisfy('4.0.0-alpha.57', '4.0.0-alpha.57')).toBe(true)
    expect(satisfy('4.0.0-alpha.58', '4.0.0-alpha.57')).toBe(false)
    expect(satisfy('4.0.0-alpha.56', '4.0.0-alpha.57')).toBe(false)
  })

  test('caret version', () => {
    expect(satisfy('4.0.0', '^4.0.0-alpha.57')).toBe(true)
    expect(satisfy('4.0.0-alpha.58', '^4.0.0-alpha.57')).toBe(true)
    expect(satisfy('4.0.0-alpha.56', '^4.0.0-alpha.57')).toBe(false)
    expect(satisfy('4.0.0-beta.56', '^4.0.0-alpha.57')).toBe(true)
    expect(satisfy('4.0.0-alpha.58', '^4.0.0-beta.57')).toBe(false)
  })
})
