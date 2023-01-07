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

export interface CompareAtom {
  operator: string
  version: string
  major: string
  minor: string
  patch: string
  preRelease?: string[]
}

function compareAtom(
  rangeAtom: string | number,
  versionAtom: string | number
): number {
  rangeAtom = +rangeAtom || rangeAtom
  versionAtom = +versionAtom || versionAtom

  if (rangeAtom > versionAtom) {
    return 1
  }

  if (rangeAtom === versionAtom) {
    return 0
  }

  return -1
}

function comparePreRelease(
  rangeAtom: CompareAtom,
  versionAtom: CompareAtom
): number {
  const { preRelease: rangePreRelease } = rangeAtom
  const { preRelease: versionPreRelease } = versionAtom

  if (rangePreRelease === undefined && !!versionPreRelease) {
    return 1
  }

  if (!!rangePreRelease && versionPreRelease === undefined) {
    return -1
  }

  if (rangePreRelease === undefined && versionPreRelease === undefined) {
    return 0
  }

  for (let i = 0, n = rangePreRelease!.length; i <= n; i++) {
    const rangeElement = rangePreRelease![i]
    const versionElement = versionPreRelease![i]

    if (rangeElement === versionElement) {
      continue
    }

    if (rangeElement === undefined && versionElement === undefined) {
      return 0
    }

    if (!rangeElement) {
      return 1
    }

    if (!versionElement) {
      return -1
    }

    return compareAtom(rangeElement, versionElement)
  }

  return 0
}

function compareVersion(
  rangeAtom: CompareAtom,
  versionAtom: CompareAtom
): number {
  return (
    compareAtom(rangeAtom.major, versionAtom.major) ||
    compareAtom(rangeAtom.minor, versionAtom.minor) ||
    compareAtom(rangeAtom.patch, versionAtom.patch) ||
    comparePreRelease(rangeAtom, versionAtom)
  )
}

function eq(rangeAtom: CompareAtom, versionAtom: CompareAtom): boolean {
  return rangeAtom.version === versionAtom.version
}

export function compare(
  rangeAtom: CompareAtom,
  versionAtom: CompareAtom
): boolean {
  switch (rangeAtom.operator) {
    case '':
    case '=':
      return eq(rangeAtom, versionAtom)
    case '>':
      return compareVersion(rangeAtom, versionAtom) < 0
    case '>=':
      return (
        eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) < 0
      )
    case '<':
      return compareVersion(rangeAtom, versionAtom) > 0
    case '<=':
      return (
        eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) > 0
      )
    case undefined: {
      // mean * or x -> all versions
      return true
    }
    default:
      return false
  }
}
