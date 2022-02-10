import type { ConfigTypeSet } from 'types'
// for generateBundle Hook replace
export const EXPOSES_MAP = new Map()
export const SHARED = 'shared'
export const DYNAMIC_LOADING_CSS = 'dynamicLoadingCss'
export const DYNAMIC_LOADING_CSS_PREFIX = '__v__css__'
export const DEFAULT_ENTRY_FILENAME = 'remoteEntry.js'
export const EXTERNALS: string[] = []
export const ROLLUP = 'rollup'
export const VITE = 'vite'
export const builderInfo = {
  builder: 'rollup',
  version: '',
  assetsDir: '',
  isHost: false,
  isRemote: false,
  isShared: false
}
export const parsedOptions = {
  prodExpose: [] as (string | ConfigTypeSet)[],
  prodRemote: [] as (string | ConfigTypeSet)[],
  prodShared: [] as (string | ConfigTypeSet)[],
  devShared: [] as (string | ConfigTypeSet)[],
  devExpose: [] as (string | ConfigTypeSet)[],
  devRemote: [] as (string | ConfigTypeSet)[]
}
