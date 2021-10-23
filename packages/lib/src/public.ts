import { RenderedChunk } from 'rollup'
import { ConfigTypeSet } from 'types'
// for generateBundle Hook replace
export const EXPOSES_CHUNK_SET = new Set<RenderedChunk>()
export const EXPOSES_MAP = new Map()
export const SHARED = 'shared'
export const IMPORT_ALIAS = '__f__import__'
export const IMPORT_ALIAS_REGEXP = new RegExp(IMPORT_ALIAS, 'g')
export const DYNAMIC_LOADING_CSS = 'dynamicLoadingCss'
export const DYNAMIC_LOADING_CSS_PREFIX = '__v__css__'
export const DEFAULT_ENTRY_FILENAME = 'remoteEntry.js'
export const EXTERNALS: string[] = []
export const ROLLUP = 'rollup'
export const VITE = 'vite'
export const builderInfo = {
  builder: 'rollup',
  version: '',
  assetsDir: ''
}
export const parsedOptions = {
  exposes: [] as (string | ConfigTypeSet)[],
  remotes: [] as (string | ConfigTypeSet)[],
  shared: [] as (string | ConfigTypeSet)[],
  devShared: [] as (string | ConfigTypeSet)[]
}
