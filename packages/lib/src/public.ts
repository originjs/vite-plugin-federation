import { OutputChunk } from 'rollup'
// for generateBundle Hook replace
export const EXPOSES_CHUNK_SET = new Set<OutputChunk>()
export const EXPOSES_MAP = new Map()
export const SHARED = 'shared'
export const IMPORT_ALIAS = '__f__import__'
export const IMPORT_ALIAS_REGEXP = new RegExp(IMPORT_ALIAS, 'g')
export const DYNAMIC_LOADING_CSS = 'dynamicLoadingCss'
export const DYNAMIC_LOADING_CSS_PREFIX = '__v__css__'
export const DEFAULT_ENTRY_FILENAME = 'remoteEntry.js'
export const EXTERNALS: string[] = []
export const MODULE_NAMES: string[] = []
export const builderInfo = {
  builder: 'rollup',
  version: ''
}
export const ROLLUP = 'rollup'
export const VITE = 'vite'
