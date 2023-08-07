// *****************************************************************************
// Copyright (C) 2022 Origin.js and others.
//
// This program and the accompanying materials are licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//          http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
// EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
// MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
//
// SPDX-License-Identifier: MulanPSL-2.0
// *****************************************************************************

import type {
  ConfigTypeSet,
  Exposes,
  Remotes,
  RemotesConfig,
  Shared,
  VitePluginFederationOptions
} from '../../types'
import { readFileSync } from 'fs'
import { createHash } from 'crypto'
import path, { parse, posix } from 'path'
import type { PluginContext } from 'rollup'

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

export function parseSharedOptions(
  options: VitePluginFederationOptions
): (string | ConfigTypeSet)[] {
  return parseOptions(
    options.shared || {},
    (value, key) => ({
      import: true,
      shareScope: 'default',
      packagePath: key,
      // Whether the path is set manually
      manuallyPackagePathSetting: false,
      generate: true
    }),
    (value, key) => {
      value.import = value.import ?? true
      value.shareScope = value.shareScope || 'default'
      value.packagePath = value.packagePath || key
      value.manuallyPackagePathSetting = value.packagePath !== key
      value.generate = value.generate ?? true
      return value
    }
  )
}

export function parseExposeOptions(
  options: VitePluginFederationOptions
): (string | ConfigTypeSet)[] {
  return parseOptions(
    options.exposes,
    (item) => {
      return {
        import: item,
        name: undefined
      }
    },
    (item) => ({
      import: item.import,
      name: item.name || undefined
    })
  )
}

export function createHashFromContent(content: string): string {
  return createHash('md5').update(content).digest('hex').toString().slice(0, 8)
}

export function createContentHash(path: string): string {
  const content = readFileSync(path, { encoding: 'utf-8' })
  return createHashFromContent(content)
}

export function parseRemoteOptions(
  options: VitePluginFederationOptions
): (string | ConfigTypeSet)[] {
  return parseOptions(
    options.remotes ? options.remotes : {},
    (item) => ({
      external: Array.isArray(item) ? item : [item],
      shareScope: options.shareScope || 'default',
      format: 'esm',
      from: 'vite',
      externalType: 'url'
    }),
    (item) => ({
      external: Array.isArray(item.external) ? item.external : [item.external],
      shareScope: item.shareScope || options.shareScope || 'default',
      format: item.format || 'esm',
      from: item.from ?? 'vite',
      externalType: item.externalType || 'url'
    })
  )
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

const letterReg = new RegExp('[0-9a-zA-Z]+')

export function removeNonRegLetter(str: string, reg = letterReg): string {
  let needUpperCase = false
  let ret = ''
  for (const c of str) {
    if (reg.test(c)) {
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
  return posix.normalize(id.replace(/\\/g, '/'))
}

export function uniqueArr<T>(arr: T[]): T[] {
  return Array.from(new Set(arr))
}

export function isSameFilepath(src: string, dest: string): boolean {
  if (!src || !dest) {
    return false
  }
  src = normalizePath(src)
  dest = normalizePath(dest)
  const srcExt = parse(src).ext
  const destExt = parse(dest).ext
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

export type Remote = { id: string; regexp: RegExp; config: RemotesConfig }

export function createRemotesMap(remotes: Remote[]): string {
  const createUrl = (remote: Remote) => {
    const external = remote.config.external[0]
    const externalType = remote.config.externalType
    if (externalType === 'promise') {
      return `()=>${external}`
    } else {
      return `'${external}'`
    }
  }
  return `const remotesMap = {
${remotes
  .map(
    (remote) =>
      `'${remote.id}':{url:${createUrl(remote)},format:'${
        remote.config.format
      }',from:'${remote.config.from}'}`
  )
  .join(',\n  ')}
};`
}

/**
 * get file extname from url
 * @param url
 */
export function getFileExtname(url: string): string {
  const fileNameAndParamArr = normalizePath(url).split('/')
  const fileNameAndParam = fileNameAndParamArr[fileNameAndParamArr.length - 1]
  const fileName = fileNameAndParam.split('?')[0]
  return path.extname(fileName)
}

export const REMOTE_FROM_PARAMETER = 'remoteFrom'
export const NAME_CHAR_REG = new RegExp('[0-9a-zA-Z@_-]+')
