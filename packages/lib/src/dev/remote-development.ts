import type { UserConfig } from 'vite'
import type {
  ConfigTypeSet,
  RemotesConfig,
  VitePluginFederationOptions
} from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { AcornNode, TransformPluginContext } from 'rollup'
import type { Hostname, ViteDevServer } from '../../types/viteDevServer'
import { getModuleMarker, normalizePath, parseRemoteOptions } from '../utils'
import { builderInfo, parsedOptions } from '../public'
import type { PluginHooks } from '../../types/pluginHooks'

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
              `'${remote.id}':{url:'${remote.config.external[0]}',format:'${remote.config.format}',from:'${remote.config.from}'}`
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
function get(name){
  return import(/* @vite-ignore */ name).then(module => ()=> { return Object.prototype.toString.call(module).indexOf('Module') > -1 && module.default ? module.default : module })
}
const shareScope = {
  ${getModuleMarker('shareScope')}
};
const initMap = Object.create(null);
async function __federation_method_ensure(remoteId) {
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

function __federation_method_unwrapDefault(module) {
  return module?.__esModule ? module['default'] : module
}

function __federation_method_wrapDefault(module ,need){
  if (!module?.default && need) {
    let obj = Object.create(null);
    obj.default = module;
    obj.__esModule = true;
    return obj;
  }
  return module; 
}

function __federation_method_getRemote(remoteName,  componentName){
  return __federation_method_ensure(remoteName).then((remote) => remote.get(componentName).then(factory => factory()));
}
export {__federation_method_ensure, __federation_method_getRemote , __federation_method_unwrapDefault , __federation_method_wrapDefault}
;`
    },
    config(config: UserConfig) {
      // need to include remotes in the optimizeDeps.exclude
      if (parsedOptions.devRemote.length) {
        const excludeRemotes: string[] = []
        parsedOptions.devRemote.forEach((item) => excludeRemotes.push(item[0]))
        let optimizeDeps = config.optimizeDeps
        if (!optimizeDeps) {
          optimizeDeps = config.optimizeDeps = {}
        }
        if (!optimizeDeps.exclude) {
          optimizeDeps.exclude = []
        }
        optimizeDeps.exclude = optimizeDeps.exclude.concat(excludeRemotes)
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
                const packageJsonPath = `${optimized[arr[0]].src?.split(regExp)[0]
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
          const scopeCode = await devSharedScopeCode.call(this, parsedOptions.devShared, browserHash)
          return code.replace(
            getModuleMarker('shareScope'),
            scopeCode.join(',')
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
            if (
              (node.type === 'ImportExpression' ||
                node.type === 'ImportDeclaration') &&
              node.source?.value?.indexOf('/') > -1
            ) {
              const moduleId = node.source.value
              const remote = remotes.find((r) => r.regexp.test(moduleId))
              const needWrap = remote?.config.from === 'vite'
              if (remote) {
                requiresRuntime = true
                const modName = `.${moduleId.slice(remote.id.length)}`
                switch (node.type) {
                  case 'ImportExpression': {
                    magicString.overwrite(
                      node.start,
                      node.end,
                      `__federation_method_getRemote(${JSON.stringify(
                        remote.id
                      )} , ${JSON.stringify(
                        modName
                      )}).then(module=>__federation_method_wrapDefault(module, ${needWrap}))`
                    )
                    break
                  }
                  case 'ImportDeclaration': {
                    if (node.specifiers?.length) {
                      const afterImportName = `__federation_var_${moduleId.replace(
                        /[@/\\.-]/g,
                        ''
                      )}`
                      magicString.overwrite(
                        node.start,
                        node.end,
                        `const ${afterImportName} = await __federation_method_getRemote(${JSON.stringify(
                          remote.id
                        )} , ${JSON.stringify(modName)});`
                      )
                      let deconstructStr = ''
                      node.specifiers.forEach((spec) => {
                        // default import , like import a from 'lib'
                        if (spec.type === 'ImportDefaultSpecifier') {
                          magicString.appendRight(
                            node.end,
                            `\n let ${spec.local.name} = __federation_method_unwrapDefault(${afterImportName}) `
                          )
                        } else if (spec.type === 'ImportSpecifier') {
                          //  like import {a as b} from 'lib'
                          const importedName = spec.imported.name
                          const localName = spec.local.name
                          deconstructStr += `${importedName === localName
                              ? localName
                              : `${importedName} : ${localName}`
                            },`
                        } else if (spec.type === 'ImportNamespaceSpecifier') {
                          //  like import * as a from 'lib'
                          magicString.appendRight(
                            node.end,
                            `let {${spec.local.name}} = ${afterImportName}`
                          )
                        }
                      })
                      if (deconstructStr.length > 0) {
                        magicString.appendRight(
                          node.end,
                          `\n let {${deconstructStr.slice(
                            0,
                            -1
                          )}} = ${afterImportName}`
                        )
                      }
                    }
                    break
                  }
                }
              }
            }
          }
        })

        if (requiresRuntime) {
          magicString.prepend(
            `import {__federation_method_ensure, __federation_method_getRemote , __federation_method_wrapDefault , __federation_method_unwrapDefault} from '__federation__';\n\n`
          )
        }
        return {
          code: magicString.toString(),
          map: null
        }
      }
    }
  }

  async function devSharedScopeCode(
    this: TransformPluginContext,
    shared: (string | ConfigTypeSet)[],
    viteVersion: string | undefined
  ): Promise<string[]> {
    const hostname = resolveHostname(viteDevServer.config.server.host)
    const protocol = viteDevServer.config.server.https ? 'https' : 'http'
    const port = viteDevServer.config.server.port ?? 5000
    const regExp = new RegExp(
      `${normalizePath(viteDevServer.config.root)}[/\\\\]`
    )
    let cacheDir = viteDevServer.config.cacheDir
    cacheDir = `${cacheDir === null || cacheDir === void 0
        ? 'node_modules/.vite'
        : normalizePath(cacheDir).split(regExp)[1]
      }`
    const res: string[] = []
    if (shared.length) {
      const cwdPath = normalizePath(process.cwd())

      for (const item of shared) {
        const moduleInfo = await this.resolve(item[0], undefined, { skipSelf: true })

        if (!moduleInfo) continue

        const moduleFilePath = normalizePath(moduleInfo.id)
        const idx = moduleFilePath.indexOf(cwdPath)

        const relativePath = idx === 0 ? moduleFilePath.slice(cwdPath.length) : null

        const sharedName = item[0]
        const obj = item[1]
        let str = ''
        if (typeof obj === 'object') {
          const url = relativePath
            ? `'${protocol}://${hostname.name}:${port}${relativePath}'`
            : `'${protocol}://${hostname.name}:${port}/${cacheDir}/${sharedName}.js?v=${viteVersion}'`

          str += `get:()=> get(${url})`
          res.push(`'${sharedName}':{'${obj.version}':{${str}}}`)
        }
      }
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
