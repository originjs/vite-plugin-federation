import { UserConfig } from 'vite'
import { ConfigTypeSet, RemotesConfig, VitePluginFederationOptions } from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { AcornNode, TransformPluginContext } from 'rollup'
import { Hostname, ViteDevServer } from '../../types/viteDevServer'
import { getModuleMarker, normalizePath, parseRemoteOptions } from '../utils'
import { builderInfo, parsedOptions } from '../public'
import { PluginHooks } from '../../types/pluginHooks'

export function devRemotePlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.devRemote = parseRemoteOptions(options)
  const remotes: { id: string; regexp: RegExp; config: RemotesConfig }[] = []
  for (const item of parsedOptions.devRemote) {
    remotes.push({
      id: item[0],
      regexp: new RegExp(`^${item[0]}/.+?`),
      config: item[1]
    })
  }

  let viteDevServer: ViteDevServer
  let browserHash: string | undefined
  return {
    name: 'originjs:remote-development',
    virtualFile: {
      __federation__: `
const remotesMap = {
  ${remotes
          .map(
              (remote) =>
                  `'${remote.id}':{url:'${remote.config.external[0]}',format:'${remote.config.format}'}`
          )
          .join(',\n  ')}
};
const loadJS = (url, fn) => {
  const script = document.createElement('script')
  script.type = 'text/javascript';
  script.onload = fn;
  script.src = url;
  document.getElementsByTagName('head')[0].appendChild(script);
}
const scriptTypes = ['var'];
const importTypes = ['esm', 'systemjs']
const webpackGet = name => import(/* @vite-ignore */ name).then(module => ()=>module?.default ?? module)
const shareScope = {
  ${getModuleMarker('shareScope')}
};
const initMap = Object.create(null);
export default {
  ensure: async (remoteId) => {
    const remote = remotesMap[remoteId];
    if (!remote.inited) {
      if (scriptTypes.includes(remote.format)) {
        // loading js with script tag
        return new Promise(resolve => {
          const callback = () => {
            if (!remote.inited) {
              remote.lib = window[remoteId];
              remote.lib.init(shareScope)
              remote.inited = true;
            }
            resolve(remote.lib);
          }
          loadJS(remote.url, callback);
        });
      } else if (importTypes.includes(remote.format)) {
        // loading js with import(...)
        return new Promise(resolve => {
          import(/* @vite-ignore */ remote.url).then(lib => {
            if (!remote.inited) {
              lib.init(shareScope);
              remote.lib = lib;
              remote.lib.init(shareScope);
              remote.inited = true;
            }
            resolve(remote.lib);
          })
        })
      }
    } else {
      return remote.lib;
    }
  }
};`
    },
    config(config: UserConfig) {
      // need to include remotes in the optimizeDeps.exclude
        if (parsedOptions.devRemote.length) {
            const excludeRemotes: string[] = []
            parsedOptions.devRemote.forEach(item => excludeRemotes.push(item[0]));
            let optimizeDeps = config.optimizeDeps;
            if (!optimizeDeps) {
                optimizeDeps = config.optimizeDeps = {};
            }
            if (!optimizeDeps.exclude) {
                optimizeDeps.exclude = [];
            }
            optimizeDeps.exclude = optimizeDeps.exclude.concat(excludeRemotes);
        }
    },

    configureServer(server: ViteDevServer) {
      // get moduleGraph for dev mode dynamic reference
      viteDevServer = server
    },
    async transform(this: TransformPluginContext, code: string, id: string) {
      if (builderInfo.isHost && !builderInfo.isRemote) {
        if (!browserHash || browserHash.length === 0) {
          browserHash = viteDevServer._optimizeDepsMetadata?.browserHash
          const optimized = viteDevServer._optimizeDepsMetadata?.optimized
          if (optimized !== undefined) {
            for (const arr of parsedOptions.devShared) {
              if (!arr[1].version) {
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
        }

        if (id === '\0virtual:__federation__') {
          return code.replace(
            getModuleMarker('shareScope'),
            devSharedScopeCode(parsedOptions.devShared, browserHash).join(',')
          )
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
                const remote = remotes.find((r) => r.regexp.test(moduleId))
                if (remote) {
                  requiresRuntime = true
                  const modName = `.${moduleId.slice(remote.id.length)}`
                  magicString.overwrite(
                    node.start,
                    node.end,
                    `__federation__.ensure(${JSON.stringify(
                      remote.id
                    )}).then((remote) => remote.get(${JSON.stringify(
                      modName
                    )}).then(factory=>factory()))`
                  )
                }
              }
            }
          }
        })

        if (requiresRuntime) {
          magicString.prepend(
            `import __federation__ from '__federation__';\n\n`
          )
        }
        return {
          code: magicString.toString(),
          map: null
        }
      }
    }
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
    if (shared.length) {
      shared.forEach((arr) => {
        const sharedName = arr[0]
        const obj = arr[1]
        let str = ''
        if (typeof obj === 'object') {
          const url = `'${protocol}://${hostname.name}:${port}/${cacheDir}/${sharedName}.js?v=${viteVersion}'`
          str += `metaGet: ()=> import(/* @vite-ignore */ ${url}),loaded:1,get:()=> webpackGet(${url})`
          res.push(`'${sharedName}':{'${obj.version}':{${str}}}`)
        }
      })
    }
    return res
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
