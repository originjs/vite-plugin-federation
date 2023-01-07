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

import { isXVersion, parseRegex } from './utils'
import {
  caret,
  caretTrim,
  comparatorTrim,
  gte0,
  hyphenRange,
  star,
  tilde,
  tildeTrim,
  xRange
} from './constants'

export function parseHyphen(range: string): string {
  return range.replace(
    parseRegex(hyphenRange),
    (
      _range,
      from,
      fromMajor,
      fromMinor,
      fromPatch,
      _fromPreRelease,
      _fromBuild,
      to,
      toMajor,
      toMinor,
      toPatch,
      toPreRelease
    ) => {
      if (isXVersion(fromMajor)) {
        from = ''
      } else if (isXVersion(fromMinor)) {
        from = `>=${fromMajor}.0.0`
      } else if (isXVersion(fromPatch)) {
        from = `>=${fromMajor}.${fromMinor}.0`
      } else {
        from = `>=${from}`
      }

      if (isXVersion(toMajor)) {
        to = ''
      } else if (isXVersion(toMinor)) {
        to = `<${+toMajor + 1}.0.0-0`
      } else if (isXVersion(toPatch)) {
        to = `<${toMajor}.${+toMinor + 1}.0-0`
      } else if (toPreRelease) {
        to = `<=${toMajor}.${toMinor}.${toPatch}-${toPreRelease}`
      } else {
        to = `<=${to}`
      }

      return `${from} ${to}`.trim()
    }
  )
}

export function parseComparatorTrim(range: string): string {
  return range.replace(parseRegex(comparatorTrim), '$1$2$3')
}

export function parseTildeTrim(range: string): string {
  return range.replace(parseRegex(tildeTrim), '$1~')
}

export function parseCaretTrim(range: string): string {
  return range.replace(parseRegex(caretTrim), '$1^')
}

export function parseCarets(range: string): string {
  return range
    .trim()
    .split(/\s+/)
    .map((rangeVersion) => {
      return rangeVersion.replace(
        parseRegex(caret),
        (_, major, minor, patch, preRelease) => {
          if (isXVersion(major)) {
            return ''
          } else if (isXVersion(minor)) {
            return `>=${major}.0.0 <${+major + 1}.0.0-0`
          } else if (isXVersion(patch)) {
            if (major === '0') {
              return `>=${major}.${minor}.0 <${major}.${+minor + 1}.0-0`
            } else {
              return `>=${major}.${minor}.0 <${+major + 1}.0.0-0`
            }
          } else if (preRelease) {
            if (major === '0') {
              if (minor === '0') {
                return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${minor}.${
                  +patch + 1
                }-0`
              } else {
                return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${
                  +minor + 1
                }.0-0`
              }
            } else {
              return `>=${major}.${minor}.${patch}-${preRelease} <${
                +major + 1
              }.0.0-0`
            }
          } else {
            if (major === '0') {
              if (minor === '0') {
                return `>=${major}.${minor}.${patch} <${major}.${minor}.${
                  +patch + 1
                }-0`
              } else {
                return `>=${major}.${minor}.${patch} <${major}.${
                  +minor + 1
                }.0-0`
              }
            }

            return `>=${major}.${minor}.${patch} <${+major + 1}.0.0-0`
          }
        }
      )
    })
    .join(' ')
}

export function parseTildes(range: string): string {
  return range
    .trim()
    .split(/\s+/)
    .map((rangeVersion) => {
      return rangeVersion.replace(
        parseRegex(tilde),
        (_, major, minor, patch, preRelease) => {
          if (isXVersion(major)) {
            return ''
          } else if (isXVersion(minor)) {
            return `>=${major}.0.0 <${+major + 1}.0.0-0`
          } else if (isXVersion(patch)) {
            return `>=${major}.${minor}.0 <${major}.${+minor + 1}.0-0`
          } else if (preRelease) {
            return `>=${major}.${minor}.${patch}-${preRelease} <${major}.${
              +minor + 1
            }.0-0`
          }

          return `>=${major}.${minor}.${patch} <${major}.${+minor + 1}.0-0`
        }
      )
    })
    .join(' ')
}

export function parseXRanges(range: string): string {
  return range
    .split(/\s+/)
    .map((rangeVersion) => {
      return rangeVersion
        .trim()
        .replace(
          parseRegex(xRange),
          (ret, gtlt, major, minor, patch, preRelease) => {
            const isXMajor = isXVersion(major)
            const isXMinor = isXMajor || isXVersion(minor)
            const isXPatch = isXMinor || isXVersion(patch)

            if (gtlt === '=' && isXPatch) {
              gtlt = ''
            }

            preRelease = ''

            if (isXMajor) {
              if (gtlt === '>' || gtlt === '<') {
                // nothing is allowed
                return '<0.0.0-0'
              } else {
                // nothing is forbidden
                return '*'
              }
            } else if (gtlt && isXPatch) {
              // replace X with 0
              if (isXMinor) {
                minor = 0
              }

              patch = 0

              if (gtlt === '>') {
                // >1 => >=2.0.0
                // >1.2 => >=1.3.0
                gtlt = '>='

                if (isXMinor) {
                  major = +major + 1
                  minor = 0
                  patch = 0
                } else {
                  minor = +minor + 1
                  patch = 0
                }
              } else if (gtlt === '<=') {
                // <=0.7.x is actually <0.8.0, since any 0.7.x should pass
                // Similarly, <=7.x is actually <8.0.0, etc.
                gtlt = '<'

                if (isXMinor) {
                  major = +major + 1
                } else {
                  minor = +minor + 1
                }
              }

              if (gtlt === '<') {
                preRelease = '-0'
              }

              return `${gtlt + major}.${minor}.${patch}${preRelease}`
            } else if (isXMinor) {
              return `>=${major}.0.0${preRelease} <${+major + 1}.0.0-0`
            } else if (isXPatch) {
              return `>=${major}.${minor}.0${preRelease} <${major}.${
                +minor + 1
              }.0-0`
            }

            return ret
          }
        )
    })
    .join(' ')
}

export function parseStar(range: string): string {
  return range.trim().replace(parseRegex(star), '')
}

export function parseGTE0(comparatorString: string): string {
  return comparatorString.trim().replace(parseRegex(gte0), '')
}
