// those constants are based on https://www.rubydoc.info/gems/semantic_range/3.0.0/SemanticRange#BUILDIDENTIFIER-constant

const buildIdentifier = '[0-9A-Za-z-]+'
const build = `(?:\\+(${buildIdentifier}(?:\\.${buildIdentifier})*))`
const numericIdentifier = '0|[1-9]\\d*'
const numericIdentifierLoose = '[0-9]+'
const nonNumericIdentifier = '\\d*[a-zA-Z-][a-zA-Z0-9-]*'
const preReleaseIdentifierLoose = `(?:${numericIdentifierLoose}|${nonNumericIdentifier})`
const preReleaseLoose = `(?:-?(${preReleaseIdentifierLoose}(?:\\.${preReleaseIdentifierLoose})*))`
const preReleaseIdentifier = `(?:${numericIdentifier}|${nonNumericIdentifier})`
const preRelease = `(?:-(${preReleaseIdentifier}(?:\\.${preReleaseIdentifier})*))`
const xRangeIdentifier = `${numericIdentifier}|x|X|\\*`
const xRangePlain = `[v=\\s]*(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:\\.(${xRangeIdentifier})(?:${preRelease})?${build}?)?)?`
export const hyphenRange = `^\\s*(${xRangePlain})\\s+-\\s+(${xRangePlain})\\s*$`
const mainVersionLoose = `(${numericIdentifierLoose})\\.(${numericIdentifierLoose})\\.(${numericIdentifierLoose})`
const loosePlain = `[v=\\s]*${mainVersionLoose}${preReleaseLoose}?${build}?`
const gtlt = '((?:<|>)?=?)'
export const comparatorTrim = `(\\s*)${gtlt}\\s*(${loosePlain}|${xRangePlain})`
const loneTilde = '(?:~>?)'
export const tildeTrim = `(\\s*)${loneTilde}\\s+`
const loneCaret = '(?:\\^)'
export const caretTrim = `(\\s*)${loneCaret}\\s+`
export const star = '(<|>)?=?\\s*\\*'
export const caret = `^${loneCaret}${xRangePlain}$`
const mainVersion = `(${numericIdentifier})\\.(${numericIdentifier})\\.(${numericIdentifier})`
const fullPlain = `v?${mainVersion}${preRelease}?${build}?`
export const tilde = `^${loneTilde}${xRangePlain}$`
export const xRange = `^${gtlt}\\s*${xRangePlain}$`
export const comparator = `^${gtlt}\\s*(${fullPlain})$|^$`
// copy from semver package
export const gte0 = '^\\s*>=\\s*0.0.0\\s*$';
