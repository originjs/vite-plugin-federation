import { ConfigEnv, UserConfig } from 'vite'
import {
  ConfigTypeSet,
  RemotesConfig,
  SharedRuntimeInfo,
  VitePluginFederationOptions
} from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { AcornNode, TransformPluginContext } from 'rollup'
import { PluginHooks } from '../types/pluginHooks'
import { ViteDevServer } from '../types/viteDevServer'
import { getModuleMarker, normalizePath, parseOptions } from './utils'
import { builderInfo, IMPORT_ALIAS, parsedOptions } from './public'
import { provideShared } from './shared'
import * as path from 'path'

export let providedRemotes

export function remotesPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.remotes = providedRemotes = parseOptions(
    options.remotes ? options.remotes : {},
    (item) => ({
      external: Array.isArray(item) ? item : [item],
      shareScope: options.shareScope || 'default'
    }),
    (item) => ({
      external: Array.isArray(item.external) ? item.external : [item.external],
      shareScope: item.shareScope || options.shareScope || 'default'
    })
  )
  const remotes: { id: string; config: RemotesConfig }[] = []
  for (const item of providedRemotes) {
    remotes.push({ id: item[0], config: item[1] })
  }
  let devProvideShared
  parsedOptions.devShared = devProvideShared = parseOptions(
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
  const devSharedNames = new Set<string>()
  devProvideShared.forEach((value) => devSharedNames.add(value[0]))
  let viteDevServer: ViteDevServer
  let browserHash: string | undefined

  return {
    name: 'originjs:remotes',
    virtualFile: {
      __federation__: `
const remotesMap = {
  ${remotes
    .map(
      (remote) =>
        `${JSON.stringify(remote.id)}: () => ${
          options.mode === 'development' ? 'import' : IMPORT_ALIAS
        }(${JSON.stringify(remote.config.external[0])})`
    )
    .join(',\n  ')}
};
const processModule = (mod) => {
  if (mod && mod.__useDefault) {
    return mod.default;
  }
  return mod;
}

const shareScope = {
  ${getModuleMarker('shareScope')}
};

async function __federation_import(name){
  return import(name);
}

const initMap = {};
           
export default {
  ensure: async (remoteId) => {
    const remote = await remotesMap[remoteId]();
    if (!initMap[remoteId]) {
      remote.init(shareScope);
      initMap[remoteId] = true;
    }
    return remote;
  }
};`
    },
    config(config: UserConfig, env: ConfigEnv) {
      // need to include remotes in the optimizeDeps.exclude
      if (options.mode === 'development') {
        let excludeRemotes: string[] = []
        for (const providedRemote of providedRemotes) {
          excludeRemotes.push(providedRemote[0])
        }
        if (
          config !== undefined &&
          config.optimizeDeps !== undefined &&
          config.optimizeDeps.exclude !== undefined
        ) {
          excludeRemotes = excludeRemotes.concat(config.optimizeDeps.exclude)
        }

        Object.assign(config, { optimizeDeps: { exclude: excludeRemotes } })
      }
    },

    configureServer(server: ViteDevServer) {
      // get moduleGraph for dev mode dynamic reference
      viteDevServer = server
    },
    async transform(
      this: TransformPluginContext,
      code: string,
      id: string,
      ssr?: boolean | undefined
    ) {
      if (
        options.mode === 'development' &&
        (browserHash === undefined || browserHash.length === 0)
      ) {
        browserHash = viteDevServer._optimizeDepsMetadata?.browserHash
        const optimized = viteDevServer._optimizeDepsMetadata?.optimized

        if (optimized !== undefined) {
          for (const arr of devProvideShared) {
            const regExp = new RegExp(`node_modules[/\\\\]${arr[0]}[/\\\\]`)
            const packageJsonPath = `${
              optimized[arr[0]].src?.split(regExp)[0]
            }node_modules/${arr[0]}/package.json`
            try {
              arr[1].version = (await import(packageJsonPath)).version
              arr[1].version.length
            } catch (e) {
              this.error(
                `No description file or no version in description file (usually package.json) of ${arr[0]}(${packageJsonPath}). Add version to description file, or manually specify version in shared config.`
              )
            }
          }
        }
      }
      for (const sharedInfo of provideShared) {
        if (!sharedInfo[1].emitFile) {
          sharedInfo[1].emitFile = this.emitFile({
            type: 'chunk',
            id: sharedInfo[0],
            fileName: `${
              builderInfo.assetsDir ? builderInfo.assetsDir + '/' : ''
            }${sharedInfo[0]}.js`,
            name: sharedInfo[0],
            preserveSignature: 'allow-extension'
          })
        }
      }

      if (id === '\0virtual:__federation__') {
        if (options.mode !== 'development') {
          return code.replace(
            getModuleMarker('shareScope'),
            sharedScopeCode.call(this, parsedOptions.shared).join(',')
          )
        } else {
          return code.replace(
            getModuleMarker('shareScope'),
            devSharedScopeCode(parsedOptions.devShared, browserHash).join(',')
          )
        }
      }
      if (id === '\0virtual:__rf_fn__import') {
        const moduleMapCode = provideShared
          .map(
            (sharedInfo) =>
              `'${
                sharedInfo[0]
              }':{get:()=>__federation_import('./${path.basename(
                this.getFileName(sharedInfo[1].emitFile)
              )}'),import:${sharedInfo[1].import}${
                sharedInfo[1].requiredVersion
                  ? `,requiredVersion:'${sharedInfo[1].requiredVersion}'`
                  : ''
              }}`
          )
          .join(',')
        return code.replace(
          getModuleMarker('moduleMap', 'var'),
          `{${moduleMapCode}}`
        )
      }
      if (remotes.length === 0 || id.includes('node_modules')) {
        return null
      }
      if (!/import/.test(code)) {
        return null
      }

      let ast: AcornNode | null = null
      try {
        ast = this.parse(code)
      } catch (err) {
        console.error(err)
      }
      if (!ast) {
        return null
      }

      const magicString = new MagicString(code)
      let requiresRuntime = false
      walk(ast, {
        enter(node: any) {
          if (node.type === 'ImportExpression') {
            if (node.source && node.source.value) {
              const moduleId = node.source.value
              const remote = remotes.find((r) => moduleId.startsWith(r.id))

              if (remote) {
                requiresRuntime = true
                const modName = `.${moduleId.slice(remote.id.length)}`

                magicString.overwrite(
                  node.start,
                  node.end,
                  `__federation__.ensure(${JSON.stringify(
                    remote.id
                  )}).then((remote) => remote.get(${JSON.stringify(modName)}))`
                )
              }
            }
          }
        }
      })

      if (requiresRuntime) {
        magicString.prepend(`import __federation__ from '__federation__';\n\n`)
      }

      return {
        code: magicString.toString(),
        map: null
      }
    }
  }

  function sharedScopeCode(
    this: TransformPluginContext,
    shared: (string | ConfigTypeSet)[]
  ): string[] {
    const res: string[] = []
    const displayField = new Set<string>()
    displayField.add('version')
    displayField.add('shareScope')
    if (shared.length) {
      shared.forEach((arr) => {
        const sharedName = arr[0]
        const obj = arr[1]
        let str = ''
        if (typeof obj === 'object') {
          Object.entries(obj).forEach(([key, value]) => {
            if (displayField.has(key))
              str += `${key}:${JSON.stringify(value)}, \n`
          })
          str += `get: ()=> __federation_import('./${path.basename(
            this.getFileName(obj.emitFile)
          )}')`
          res.push(`'${sharedName}':{${str}}`)
        }
      })
    }
    return res
  }

  function devSharedScopeCode(
    shared: (string | ConfigTypeSet)[],
    viteVersion: string | undefined
  ): string[] {
    const hostname = resolveHostname(viteDevServer.config.server.host)
    const protocol = viteDevServer.config.server.https ? 'https' : 'http'
    const port = viteDevServer.config.server.port ?? 5000
    const regExp = new RegExp(
      `${normalizePath(viteDevServer.config.root)}[/\\\\]`
    )
    let cacheDir = viteDevServer.config.cacheDir
    cacheDir = `${
      cacheDir === null || cacheDir === void 0
        ? 'node_modules/.vite'
        : normalizePath(cacheDir).split(regExp)[1]
    }`
    const res: string[] = []
    const displayField = new Set<string>()
    displayField.add('version')
    displayField.add('shareScope')
    if (shared.length) {
      shared.forEach((arr) => {
        const sharedName = arr[0]
        const obj = arr[1]
        let str = ''
        if (typeof obj === 'object') {
          Object.entries(obj).forEach(([key, value]) => {
            if (displayField.has(key))
              str += `${key}:${JSON.stringify(value)}, \n`
          })
          str += `get: ()=> import('${protocol}://${hostname.name}:${port}/${cacheDir}/${sharedName}.js?v=${viteVersion}') `
          res.push(`'${sharedName}':{${str}}\n`)
        }
      })
    }
    return res
  }

  interface Hostname {
    // undefined sets the default behaviour of server.listen
    host: string | undefined
    // resolve to localhost when possible
    name: string
  }

  function resolveHostname(
    optionsHost: string | boolean | undefined
  ): Hostname {
    let host: string | undefined
    if (
      optionsHost === undefined ||
      optionsHost === false ||
      optionsHost === 'localhost'
    ) {
      // Use a secure default
      host = '127.0.0.1'
    } else if (optionsHost === true) {
      // If passed --host in the CLI without arguments
      host = undefined // undefined typically means 0.0.0.0 or :: (listen on all IPs)
    } else {
      host = optionsHost
    }

    // Set host name to localhost when possible, unless the user explicitly asked for '127.0.0.1'
    const name =
      (optionsHost !== '127.0.0.1' && host === '127.0.0.1') ||
      host === '0.0.0.0' ||
      host === '::' ||
      host === undefined
        ? 'localhost'
        : host

    return { host, name }
  }
}
