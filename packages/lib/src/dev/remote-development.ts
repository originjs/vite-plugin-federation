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

import type { UserConfig } from 'vite'
import type {
  ConfigTypeSet,
  RemotesConfig,
  VitePluginFederationOptions
} from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { readFileSync } from 'fs'
import type { AcornNode, TransformPluginContext } from 'rollup'
import type { ViteDevServer } from '../../types/viteDevServer'
import {
  createRemotesMap,
  getFileExtname,
  getModuleMarker,
  normalizePath,
  parseRemoteOptions,
  REMOTE_FROM_PARAMETER
} from '../utils'
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

  const needHandleFileType = [
    '.js',
    '.ts',
    '.jsx',
    '.tsx',
    '.mjs',
    '.cjs',
    '.vue',
    '.svelte'
  ]
  options.transformFileTypes = (options.transformFileTypes ?? [])
    .concat(needHandleFileType)
    .map((item) => item.toLowerCase())
  const transformFileTypeSet = new Set(options.transformFileTypes)
  let viteDevServer: ViteDevServer
  return {
    name: 'originjs:remote-development',
    virtualFile: {
      __federation__: `
${createRemotesMap(remotes)}
const loadJS = async (url, fn) => {
  const resolvedUrl = typeof url === 'function' ? await url() : url;
  const script = document.createElement('script')
  script.type = 'text/javascript';
  script.onload = fn;
  script.src = resolvedUrl;
  document.getElementsByTagName('head')[0].appendChild(script);
}
function get(name, ${REMOTE_FROM_PARAMETER}){
  return import(/* @vite-ignore */ name).then(module => ()=> {
    if (${REMOTE_FROM_PARAMETER} === 'webpack') {
      return Object.prototype.toString.call(module).indexOf('Module') > -1 && module.default ? module.default : module
    }
    return module
  })
}
const wrapShareScope = ${REMOTE_FROM_PARAMETER} => {
  return {
    ${getModuleMarker('shareScope')}
  }
}
const initMap = Object.create(null);
async function __federation_method_ensure(remoteId) {
  const remote = remotesMap[remoteId];
  if (!remote.inited) {
    if ('var' === remote.format) {
      // loading js with script tag
      return new Promise(resolve => {
        const callback = () => {
          if (!remote.inited) {
            remote.lib = window[remoteId];
            remote.lib.init(wrapShareScope(remote.from))
            remote.inited = true;
          }
          resolve(remote.lib);
        }
        return loadJS(remote.url, callback);
      });
    } else if (['esm', 'systemjs'].includes(remote.format)) {
      // loading js with import(...)
      return new Promise((resolve, reject) => {
        const getUrl = typeof remote.url === 'function' ? remote.url : () => Promise.resolve(remote.url);
        getUrl().then(url => {
          import(/* @vite-ignore */ url).then(lib => {
            if (!remote.inited) {
              const shareScope = wrapShareScope(remote.from)
              lib.init(shareScope);
              remote.lib = lib;
              remote.lib.init(shareScope);
              remote.inited = true;
            }
            resolve(remote.lib);
          }).catch(reject)
        })
      })
    }
  } else {
    return remote.lib;
  }
}

function __federation_method_unwrapDefault(module) {
  return (module?.__esModule || module?.[Symbol.toStringTag] === 'Module')?module.default:module
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
        for (const arr of parsedOptions.devShared) {
          if (!arr[1].version && !arr[1].manuallyPackagePathSetting) {
            const packageJsonPath = (
              await this.resolve(`${arr[0]}/package.json`)
            )?.id
            if (!packageJsonPath) {
              this.error(
                `No description file or no version in description file (usually package.json) of ${arr[0]}(${packageJsonPath}). Add version to description file, or manually specify version in shared config.`
              )
            } else {
              const json = JSON.parse(
                readFileSync(packageJsonPath, { encoding: 'utf-8' })
              )
              arr[1].version = json.version
            }
          }
        }
      }

      if (id === '\0virtual:__federation__') {
        const scopeCode = await devSharedScopeCode.call(
          this,
          parsedOptions.devShared
        )
        return code.replace(getModuleMarker('shareScope'), scopeCode.join(','))
      }

      // ignore some not need to handle file types
      const fileExtname = getFileExtname(id)
      if (!transformFileTypeSet.has((fileExtname ?? '').toLowerCase())) {
        return
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
      const hasStaticImported = new Map<string, string>()

      let requiresRuntime = false
      walk(ast, {
        enter(node: any) {
          if (
            (node.type === 'ImportExpression' ||
              node.type === 'ImportDeclaration' ||
              node.type === 'ExportNamedDeclaration') &&
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
                    if (!hasStaticImported.has(moduleId)) {
                      magicString.overwrite(
                        node.start,
                        node.end,
                        `const ${afterImportName} = await __federation_method_getRemote(${JSON.stringify(
                          remote.id
                        )} , ${JSON.stringify(modName)});`
                      )
                      hasStaticImported.set(moduleId, afterImportName)
                    }
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
                        deconstructStr += `${
                          importedName === localName
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
                case 'ExportNamedDeclaration': {
                  // handle export like export {a} from 'remotes/lib'
                  const afterImportName = `__federation_var_${moduleId.replace(
                    /[@/\\.-]/g,
                    ''
                  )}`
                  if (!hasStaticImported.has(moduleId)) {
                    hasStaticImported.set(moduleId, afterImportName)
                    magicString.overwrite(
                      node.start,
                      node.end,
                      `const ${afterImportName} = await __federation_method_getRemote(${JSON.stringify(
                        remote.id
                      )} , ${JSON.stringify(modName)});`
                    )
                  }
                  if (node.specifiers.length > 0) {
                    const specifiers = node.specifiers
                    let exportContent = ''
                    let deconstructContent = ''
                    specifiers.forEach((spec) => {
                      const localName = spec.local.name
                      const exportName = spec.exported.name
                      const variableName = `${afterImportName}_${localName}`
                      deconstructContent = deconstructContent.concat(
                        `${localName}:${variableName},`
                      )
                      exportContent = exportContent.concat(
                        `${variableName} as ${exportName},`
                      )
                    })
                    magicString.append(
                      `\n const {${deconstructContent.slice(
                        0,
                        deconstructContent.length - 1
                      )}} = ${afterImportName}; \n`
                    )
                    magicString.append(
                      `\n export {${exportContent.slice(
                        0,
                        exportContent.length - 1
                      )}}; `
                    )
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
      return magicString.toString()
    }
  }

  async function devSharedScopeCode(
    this: TransformPluginContext,
    shared: (string | ConfigTypeSet)[]
  ): Promise<string[]> {
    const serverConfiguration = viteDevServer.config.server
    const protocol = serverConfiguration.https ? 'https' : 'http'
    const port = serverConfiguration.port ?? 5173
    const res: string[] = []
    if (shared.length) {
      const cwdPath = normalizePath(process.cwd())

      for (const item of shared) {
        const moduleInfo = await this.resolve(item[1].packagePath, undefined, {
          skipSelf: true
        })

        if (!moduleInfo) continue

        const moduleFilePath = normalizePath(moduleInfo.id)
        const idx = moduleFilePath.indexOf(cwdPath)

        const relativePath =
          idx === 0 ? moduleFilePath.slice(cwdPath.length) : null

        const sharedName = item[0]
        const obj = item[1]
        let str = ''
        if (typeof obj === 'object') {
          const address =
            serverConfiguration.origin ??
            `${protocol}://${resolveHost(serverConfiguration)}:${port}`
          const url = relativePath
            ? `'${address}${relativePath}'`
            : `'${address}/@fs/${moduleInfo.id}'`
          str += `get:()=> get(${url}, ${REMOTE_FROM_PARAMETER})`
          res.push(`'${sharedName}':{'${obj.version}':{${str}}}`)
        }
      }
    }
    return res
  }

  function resolveHost(serverOptions): string {
    const hostConfiguration = serverOptions.host
    let host: string
    //
    if (
      hostConfiguration === undefined ||
      typeof hostConfiguration === 'boolean'
    ) {
      host = 'localhost'
    } else {
      host = hostConfiguration
    }
    return host
  }
}
