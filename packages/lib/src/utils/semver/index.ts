import { extractComparator, pipe } from './utils'
import {
  parseHyphen,
  parseComparatorTrim,
  parseTildeTrim,
  parseCaretTrim,
  parseCarets,
  parseTildes,
  parseXRanges,
  parseStar,
  parseGTE0,
} from './parser'
import { compare, CompareAtom } from './compare'

function parseComparatorString(range: string): string {
  return pipe(
    // handle caret
    // ^ --> * (any, kinda silly)
    // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
    // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
    // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
    // ^1.2.3 --> >=1.2.3 <2.0.0-0
    // ^1.2.0 --> >=1.2.0 <2.0.0-0
    parseCarets,
    // handle tilde
    // ~, ~> --> * (any, kinda silly)
    // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
    // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
    // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
    // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
    // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
    parseTildes,
    parseXRanges,
    parseStar,
  )(range)
}

function parseRange(range: string) {
  return pipe(
    // handle hyphenRange
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    parseHyphen,
    // handle trim comparator
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    parseComparatorTrim,
    // handle trim tilde
    // `~ 1.2.3` => `~1.2.3`
    parseTildeTrim,
    // handle trim caret
    // `^ 1.2.3` => `^1.2.3`
    parseCaretTrim,
  )(range.trim()).split(/\s+/).join(' ')
}

function satisfy(version: string, range: string): boolean {
  if (!version) {
    return false
  }

  const parsedRange = parseRange(range)
  const parsedComparator = parsedRange.split(' ').map((rangeVersion) => parseComparatorString(rangeVersion)).join(' ')
  const comparators = parsedComparator.split(/\s+/).map((comparator) => parseGTE0(comparator))
  const extractedVersion = extractComparator(version)

  if (!extractedVersion) {
    return false
  }

  const [, versionOperator, versionRaw, versionMajor, versionMinor, versionPatch, versionPreRelease] = extractedVersion
  const versionAtom: CompareAtom = {
    operator: versionOperator,
    version: versionRaw,
    major: versionMajor,
    minor: versionMinor,
    patch: versionPatch,
    preRelease: versionPreRelease,
  }

  for (const comparator of comparators) {
    const extractedComparator = extractComparator(comparator)

    if (!extractedComparator) {
      return false
    }

    const [, rangeOperator, rangeRaw, rangeMajor, rangeMinor, rangePatch, rangePreRelease] = extractedComparator
    const rangeAtom: CompareAtom = {
      operator: rangeOperator,
      version: rangeRaw,
      major: rangeMajor,
      minor: rangeMinor,
      patch: rangePatch,
      preRelease: rangePreRelease,
    }

    const a = compare(rangeAtom, versionAtom)
    if (!a) {
      return false // early return
    }
  }

  return true
}

export const semver = {
  satisfy,
}
