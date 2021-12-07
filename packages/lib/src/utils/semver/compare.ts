export interface CompareAtom {
  operator: string
  version: string
  major: string
  minor: string
  patch: string
  preRelease?: string
}

function compareAtom(rangeAtom: string | number, versionAtom: string | number): number {
  rangeAtom = +rangeAtom
  versionAtom = +versionAtom

  if (rangeAtom > versionAtom) {
    return 1
  }

  if (rangeAtom === versionAtom) {
    return 0
  }

  return -1
}

function compareVersion(rangeAtom: CompareAtom, versionAtom: CompareAtom): number {
  return compareAtom(rangeAtom.major, versionAtom.major)
    || compareAtom(rangeAtom.minor, versionAtom.minor)
    || compareAtom(rangeAtom.patch, versionAtom.patch)
}

function eq(rangeAtom: CompareAtom, versionAtom: CompareAtom): boolean {
  return rangeAtom.version === versionAtom.version
}

export function compare(rangeAtom: CompareAtom, versionAtom: CompareAtom): boolean {
  switch (rangeAtom.operator) {
    case '':
    case '=':
      return eq(rangeAtom, versionAtom)
    case '>':
      return compareVersion(rangeAtom, versionAtom) < 0
    case '>=':
      return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) < 0
    case '<':
      return compareVersion(rangeAtom, versionAtom) > 0
    case '<=':
      return eq(rangeAtom, versionAtom) || compareVersion(rangeAtom, versionAtom) > 0
    default:
      return false
  }
}
