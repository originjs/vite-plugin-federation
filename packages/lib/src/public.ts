import { OutputChunk } from 'rollup'
// for generateBundle Hook replace
export const exposesChunkSet = new Set<OutputChunk>()
export const SHARED = 'shared'
export const IMPORT_ALIAS = '__f__import__'
export const IMPORT_ALIAS_REGEXP = new RegExp(IMPORT_ALIAS, 'g')
export const externals: string[] = []
export const moduleNames: string[] = []
