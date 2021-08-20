import { OutputChunk } from 'rollup'
// for generateBundle Hook replace
const replaceMap = new Map()
const entryChunkSet = new Set<OutputChunk>()
const exposesChunkSet = new Set<OutputChunk>()
const SHARED = 'shared'
const IMPORT_ALIAS = '__f__import__'
export { replaceMap, exposesChunkSet, entryChunkSet }
export { SHARED, IMPORT_ALIAS }
