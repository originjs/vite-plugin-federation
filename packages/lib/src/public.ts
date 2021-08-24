import { OutputChunk } from 'rollup'
// for generateBundle Hook replace
export const replaceMap = new Map()
export const entryChunkSet = new Set<OutputChunk>()
export const exposesChunkSet = new Set<OutputChunk>()
export const SHARED = 'shared'
export const IMPORT_ALIAS = '__f__import__'
export const externals: string[] = []
export const moduleNames: string[] = []
