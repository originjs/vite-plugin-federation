import { Exposes, Remotes, Shared, ConfigTypeSet } from '../types'
import * as path from 'path'
import { PluginContext } from 'rollup'

export function findDependencies(
  this: PluginContext,
  id: string,
  sets: Set<string>,
  sharedModuleIds: Map<string, string>,
  usedSharedModuleIds: Set<string>
): void {
  if (!sets.has(id)) {
    sets.add(id)
    const moduleInfo = this.getModuleInfo(id)
    if (moduleInfo?.importedIds) {
      moduleInfo.importedIds.forEach((id) => {
        findDependencies.apply(this, [
          id,
          sets,
          sharedModuleIds,
          usedSharedModuleIds
        ])
      })
    }
    if (sharedModuleIds.has(id)) {
      usedSharedModuleIds.add(sharedModuleIds.get(id) as string)
    }
  }
}

export function parseOptions(
  options: Exposes | Remotes | Shared | undefined,
  normalizeSimple: (value: any, key: any) => ConfigTypeSet,
  normalizeOptions: (value: any, key: any) => ConfigTypeSet
): (string | ConfigTypeSet)[] {
  if (!options) {
    return []
  }
  const list: {
    [index: number]: string | ConfigTypeSet
  }[] = []
  const array = (items: (string | ConfigTypeSet)[]) => {
    for (const item of items) {
      if (typeof item === 'string') {
        list.push([item, normalizeSimple(item, item)])
      } else if (item && typeof item === 'object') {
        object(item)
      } else {
        throw new Error('Unexpected options format')
      }
    }
  }
  const object = (obj) => {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' || Array.isArray(value)) {
        list.push([key, normalizeSimple(value, key)])
      } else {
        list.push([key, normalizeOptions(value, key)])
      }
    }
  }
  if (Array.isArray(options)) {
    array(options)
  } else if (typeof options === 'object') {
    object(options)
  } else {
    throw new Error('Unexpected options format')
  }
  return list
}

export function removeNonLetter(str: string): string {
  const wordRegexp = new RegExp('\\w+')
  let needUpperCase = false
  let ret = ''
  for (const c of str) {
    if (wordRegexp.test(c)) {
      ret += needUpperCase ? c.toUpperCase() : c
      needUpperCase = false
    } else {
      needUpperCase = true
    }
  }
  return ret
}

export function getModuleMarker(value: string, type?: string): string {
  return type ? `__rf_${type}__${value}` : `__rf_placeholder__${value}`
}

export function normalizePath(id: string): string {
  return path.posix.normalize(id.replace(/\\/g, '/'))
}

export function isSameFilepath(src: string, dest: string): boolean {
  if (!src || !dest) {
    return false
  }
  src = normalizePath(src)
  dest = normalizePath(dest)
  const srcExt = path.parse(src).ext
  const destExt = path.parse(dest).ext
  if (srcExt && destExt && srcExt !== destExt) {
    return false
  }
  if (srcExt) {
    src = src.slice(0, -srcExt.length)
  }
  if (destExt) {
    dest = dest.slice(0, -destExt.length)
  }
  return src === dest
}
