import type {
  ConfigTypeSet,
  Exposes,
  Remotes,
  RemotesConfig,
  Shared,
  SharedRuntimeInfo,
  VitePluginFederationOptions
} from '../../types'
import { parse, posix } from 'path'
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
): (string | (ConfigTypeSet & SharedRuntimeInfo))[] {
  return parseOptions(
    options.shared || {},
    () => ({
      import: true,
      shareScope: 'default'
    }),
    (value) => {
      value.import = value.import ?? true
      value.shareScope = value.shareScope || 'default'
      return value
    }
  ) as (string | (ConfigTypeSet & SharedRuntimeInfo))[]
}

export function parseExposeOptions(
  options: VitePluginFederationOptions
): (string | ConfigTypeSet)[] {
  return parseOptions(
    options.exposes,
    (item) => ({
      import: item,
      name: undefined
    }),
    (item) => ({
      import: Array.isArray(item.import) ? item.import : [item.import],
      name: item.name || undefined
    })
  )
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
      from: 'vite'
    }),
    (item) => ({
      external: Array.isArray(item.external) ? item.external : [item.external],
      shareScope: item.shareScope || options.shareScope || 'default',
      format: item.format || 'esm',
      from: item.from ?? 'vite'
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
    if (external.startsWith('promise ')) {
      return `() => ${external.slice(8)}`
    }
    return `'${external}'`
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
