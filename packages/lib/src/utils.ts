import { SharedObject, SharedConfig } from '../types'
import * as path from 'path'
import { IMPORT_ALIAS } from './public'
import { PluginContext } from 'rollup'

export function sharedAssign(
  assign: Map<string, Map<string, string>>,
  shared: (string | SharedObject)[] | SharedObject
): Map<string, Map<string, string>> {
  shared = shared || []
  if (!Array.isArray(shared)) {
    shared = [shared]
  }
  shared.forEach((item) => {
    if (typeof item === 'string') {
      assign.set(item, new Map<string, string>())
    } else {
      // type is SharedObject
      for (const key in item) {
        if (Object.prototype.hasOwnProperty.call(item, key) && item[key]) {
          const paramMap: Map<string, string> = new Map()
          if (typeof item[key] === 'string') {
            paramMap.set('version', item[key] as string)
          } else {
            for (const itemElementKey in item[key] as SharedConfig) {
              paramMap.set(itemElementKey, item[key][itemElementKey])
            }
          }
          assign.set(key, paramMap)
        }
      }
    }
  })

  return assign
}

export function findDependencies(
  this: PluginContext,
  id: string,
  sets: Set<string>
): void {
  if (!sets.has(id)) {
    sets.add(id)
    const moduleInfo = this.getModuleInfo(id)
    if (moduleInfo?.importedIds) {
      moduleInfo.importedIds.forEach((id) => {
        findDependencies.apply(this, [id, sets])
      })
    }
  }
}

export function sharedScopeCode(
  shared: Map<string, Map<string, any>>,
  modules: string[]
): string[] {
  const res: string[] = []
  if (shared.size) {
    shared.forEach((value, key) => {
      let str = ''
      value.forEach((innerValue, innerkey) => {
        str += `${innerkey}:${JSON.stringify(innerValue)}, \n`
      })
      str += `get: ()=> ${IMPORT_ALIAS}('${getModuleMarker(
        `\${${key}}`,
        'shareScope'
      )}')`
      res.push(`'${key}':{${str}}`)
    })
  }
  return res
}

export function parseOptions(
  options,
  normalizeSimple,
  normalizeOptions
): any[] {
  if (!options) {
    return []
  }
  const list: any[] = []
  const array = (items) => {
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
  return str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
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
