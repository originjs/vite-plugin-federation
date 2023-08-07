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

import type { ConfigTypeSet, VitePluginFederationOptions } from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { AcornNode, TransformPluginContext } from 'rollup'
import {
  createRemotesMap,
  getModuleMarker,
  parseRemoteOptions,
  Remote,
  removeNonRegLetter,
  REMOTE_FROM_PARAMETER,
  NAME_CHAR_REG,
  createHashFromContent
} from '../utils'
import { builderInfo, EXPOSES_KEY_MAP, parsedOptions } from '../public'
import { basename } from 'path'
import type { PluginHooks } from '../../types/pluginHooks'

const sharedFileName2Prop: Map<string, ConfigTypeSet> = new Map<
  string,
  ConfigTypeSet
>()

export function prodRemotePlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.prodRemote = parseRemoteOptions(options)
  const remotes: Remote[] = []
  for (const item of parsedOptions.prodRemote) {
    remotes.push({
      id: item[0],
      regexp: new RegExp(`^${item[0]}/.+?`),
      config: item[1]
    })
  }

  return {
    name: 'originjs:remote-production',
    virtualFile: {
      // language=JS
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

                function get(name, ${REMOTE_FROM_PARAMETER}) {
                    return __federation_import(name).then(module => () => {
                        if (${REMOTE_FROM_PARAMETER} === 'webpack') {
                            return Object.prototype.toString.call(module).indexOf('Module') > -1 && module.default ? module.default : module
                        }
                        return module
                    })
                }

                const wrapShareModule = ${REMOTE_FROM_PARAMETER} => {
                    return {
                        ${getModuleMarker('shareScope')}
                    }
                }

                async function __federation_import(name) {
                    return import(name);
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
                                        remote.lib.init(wrapShareModule(remote.from))
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
                                            const shareScope = wrapShareModule(remote.from)
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
                    return (module?.__esModule || module?.[Symbol.toStringTag] === 'Module') ? module.default : module
                }

                function __federation_method_wrapDefault(module, need) {
                    if (!module?.default && need) {
                        let obj = Object.create(null);
                        obj.default = module;
                        obj.__esModule = true;
                        return obj;
                    }
                    return module;
                }

                function __federation_method_getRemote(remoteName, componentName) {
                    return __federation_method_ensure(remoteName).then((remote) => remote.get(componentName).then(factory => factory()));
                }

                export {
                    __federation_method_ensure,
                    __federation_method_getRemote,
                    __federation_method_unwrapDefault,
                    __federation_method_wrapDefault
                }
            `
    },

    async transform(this: TransformPluginContext, code: string, id: string) {
      if (builderInfo.isShared) {
        for (const sharedInfo of parsedOptions.prodShared) {
          if (!sharedInfo[1].emitFile) {
            const basename = `__federation_shared_${removeNonRegLetter(
              sharedInfo[0],
              NAME_CHAR_REG
            )}-${createHashFromContent(code)}.js`
            sharedInfo[1].emitFile = this.emitFile({
              type: 'chunk',
              id: sharedInfo[1].id ?? sharedInfo[1].packagePath,
              fileName: `${
                builderInfo.assetsDir ? builderInfo.assetsDir + '/' : ''
              }${
                sharedInfo[1].root ? sharedInfo[1].root[0] + '/' : ''
              }${basename}`,
              preserveSignature: 'allow-extension',
              name: sharedInfo[0]
            })
            sharedFileName2Prop.set(basename, sharedInfo as ConfigTypeSet)
          }
        }

        if (id === '\0virtual:__federation_fn_import') {
          const moduleMapCode = parsedOptions.prodShared
            .filter((shareInfo) => shareInfo[1].generate)
            .map(
              (sharedInfo) =>
                `'${sharedInfo[0]}':{get:()=>()=>__federation_import('./${
                  sharedInfo[1].root ? `${sharedInfo[1].root[0]}/` : ''
                }${basename(
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
      }

      if (builderInfo.isRemote) {
        for (const expose of parsedOptions.prodExpose) {
          if (!expose[1].emitFile) {
            expose[1].emitFile = this.emitFile({
              type: 'chunk',
              id: expose[1].id ?? expose[1].import,
              name: EXPOSES_KEY_MAP.get(expose[0]),
              preserveSignature: 'allow-extension'
            })
          }
        }
      }

      if (builderInfo.isHost) {
        if (id === '\0virtual:__federation__') {
          const res: string[] = []
          parsedOptions.prodShared.forEach((arr) => {
            const obj = arr[1]
            let str = ''
            if (typeof obj === 'object') {
              const fileName = `./${basename(this.getFileName(obj.emitFile))}`
              str += `get:()=>get('${fileName}', ${REMOTE_FROM_PARAMETER}), loaded:1`
              res.push(`'${arr[0]}':{'${obj.version}':{${str}}}`)
            }
          })
          return code.replace(getModuleMarker('shareScope'), res.join(','))
        }
      }

      if (builderInfo.isHost || builderInfo.isShared) {
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
        let hasImportShared = false
        let modify = false

        walk(ast, {
          enter(node: any) {
            // handle share, eg. replace import {a} from b  -> const a = importShared('b')
            if (node.type === 'ImportDeclaration') {
              const moduleName = node.source.value
              if (
                parsedOptions.prodShared.some(
                  (sharedInfo) => sharedInfo[0] === moduleName
                )
              ) {
                const namedImportDeclaration: (string | never)[] = []
                let defaultImportDeclaration: string | null = null
                if (!node.specifiers?.length) {
                  // invalid import , like import './__federation_shared_lib.js' , and remove it
                  magicString.remove(node.start, node.end)
                  modify = true
                } else {
                  node.specifiers.forEach((specify) => {
                    if (specify.imported?.name) {
                      namedImportDeclaration.push(
                        `${
                          specify.imported.name === specify.local.name
                            ? specify.imported.name
                            : `${specify.imported.name}:${specify.local.name}`
                        }`
                      )
                    } else {
                      defaultImportDeclaration = specify.local.name
                    }
                  })

                  hasImportShared = true

                  if (
                    defaultImportDeclaration &&
                    namedImportDeclaration.length
                  ) {
                    // import a, {b} from 'c' -> const a = await importShared('c'); const {b} = a;
                    const imports = namedImportDeclaration.join(',')
                    const line = `const ${defaultImportDeclaration} = await importShared('${moduleName}');\nconst {${imports}} = ${defaultImportDeclaration};\n`
                    magicString.overwrite(node.start, node.end, line)
                  } else if (defaultImportDeclaration) {
                    magicString.overwrite(
                      node.start,
                      node.end,
                      `const ${defaultImportDeclaration} = await importShared('${moduleName}');\n`
                    )
                  } else if (namedImportDeclaration.length) {
                    magicString.overwrite(
                      node.start,
                      node.end,
                      `const {${namedImportDeclaration.join(
                        ','
                      )}} = await importShared('${moduleName}');\n`
                    )
                  }
                }
              }
            }

            // handle remote import , eg replace import {a} from 'remote/b' to dynamic import
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
                        hasStaticImported.set(moduleId, afterImportName)
                        magicString.overwrite(
                          node.start,
                          node.end,
                          `const ${afterImportName} = await __federation_method_getRemote(${JSON.stringify(
                            remote.id
                          )} , ${JSON.stringify(modName)});`
                        )
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

        if (hasImportShared) {
          magicString.prepend(
            `import {importShared} from '\0virtual:__federation_fn_import';\n`
          )
        }

        if (requiresRuntime || hasImportShared || modify) {
          return {
            code: magicString.toString(),
            map: magicString.generateMap({ hires: true })
          }
        }
      }
    }
  }
}

export { sharedFileName2Prop }
