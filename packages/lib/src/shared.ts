import { PluginHooks } from '../types/pluginHooks'
import { findDependencies, getModuleMarker, parseOptions } from './utils'
import {
  builderInfo,
  EXPOSES_CHUNK_SET,
  EXPOSES_MAP,
  parsedOptions
} from './public'
import {
  ConfigTypeSet,
  SharedRuntimeInfo,
  VitePluginFederationOptions
} from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import * as path from 'path'

export let provideShared: (string | (ConfigTypeSet & SharedRuntimeInfo))[]

export function sharedPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.shared = provideShared = parseOptions(
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
  const sharedNames = new Set<string>()
  provideShared.forEach((value) => sharedNames.add(value[0]))
  const exposesModuleIdSet = new Set()
  EXPOSES_MAP.forEach((value) => {
    exposesModuleIdSet.add(`${value}.js`)
  })
  let isHost
  let isRemote

  return {
    name: 'originjs:shared',
    virtualFile: {
      __rf_fn__import: `
      const moduleMap= ${getModuleMarker('moduleMap', 'var')}
      const moduleCache = Object.create(null);
      async function importShared(name,shareScope = 'default') {
        return moduleCache[name] ? new Promise((r) => r(moduleCache[name])) : getProviderSharedModule(name, shareScope);
      }
      async function __federation_import(name){
        return import(name);
      }
      async function getProviderSharedModule(name,shareScope) {
        let module = null;
        if (globalThis?.__rf_var__shared?.[shareScope]?.[name]) {
          const dep = globalThis.__rf_var__shared[shareScope][name];
          if (moduleMap[name]?.requiredVersion) {
            // judge version satisfy
            const satisfies = await import('semver/functions/satisfies');
            const fn = satisfies.default||satisfies
            if (fn(dep.version, moduleMap[name].requiredVersion)) {
               module = await dep.get();
            } else {
              console.log(\`provider support \${name}(\${dep.version}) is not satisfied requiredVersion(\${moduleMap[name].requiredVersion})\`)
            }
          } else {
            module = await dep.get(); 
          }
        }
        if(module){
          moduleCache[name] = module;
          return module;
        }else{
          return getConsumerSharedModule(name, shareScope);
        }
      }
      async function getConsumerSharedModule(name , shareScope) {
        if (moduleMap[name]?.import) {
          const module = await moduleMap[name].get()
          moduleCache[name] = module;
          return module;
        } else {
          console.error(\`consumer config import=false,so cant use callback shared module\`)
        }
      }
      export {importShared};
      `
    },
    options(inputOptions) {
      isHost = !!parsedOptions.remotes.length
      isRemote = !!parsedOptions.exposes.length

      if (sharedNames.size) {
        // remove item which is both in external and shared
        inputOptions.external = (inputOptions.external as [])?.filter(
          (item) => {
            return !sharedNames.has(item)
          }
        )
        // sharedNames.forEach((shareName) => {
        //     inputOptions.input![`${getModuleMarker(shareName, 'input')}`] =
        //         shareName
        // })
      }
      return inputOptions
    },

    async buildStart() {
      for (const arr of provideShared) {
        const id = await this.resolveId(arr[0])
        arr[1].id = id
        if (isHost && !arr[1].version) {
          const regExp = new RegExp(`node_modules[/\\\\]${arr[0]}[/\\\\]`)
          const packageJsonPath = `${id?.split(regExp)[0]}node_modules/${
            arr[0]
          }/package.json`
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
      if (provideShared.length && isRemote) {
        this.emitFile({
          fileName: `${
            builderInfo.assetsDir ? builderInfo.assetsDir + '/' : ''
          }__rf_fn__import.js`,
          type: 'chunk',
          id: '__rf_fn__import',
          preserveSignature: 'strict'
        })
      }
    },

    async buildEnd() {
      for (const sharedInfo of provideShared) {
        if (!sharedInfo[1].id) {
          const resolved = await this.resolve(sharedInfo[0])
          sharedInfo[1].id = resolved?.id
        }
      }
    },

    outputOptions: function (outputOption) {
      const that = this
      const priority: string[] = []
      const depInShared = new Map()
      provideShared.forEach((value) => {
        const shareName = value[0]
        // pick every shared moduleId
        const usedSharedModuleIds = new Set<string>()
        const sharedModuleIds = new Map<string, string>()
        // exclude itself
        provideShared
          .filter((item) => item[0] !== shareName)
          .forEach((item) => sharedModuleIds.set(item[1].id, item[0]))
        depInShared.set(shareName, usedSharedModuleIds)
        const deps = new Set<string>()
        findDependencies.apply(that, [
          value[1].id,
          deps,
          sharedModuleIds,
          usedSharedModuleIds
        ])
        value[1].dependencies = deps
      })
      // judge dependencies priority
      const orderByDepCount: Map<string, Set<string>>[] = []
      depInShared.forEach((value, key) => {
        if (!orderByDepCount[value.size]) {
          orderByDepCount[value.size] = new Map()
        }
        orderByDepCount[value.size].set(key, value)
      })

      // dependency nothing is first
      for (let i = 0; i < orderByDepCount.length; i++) {
        if (i === 0) {
          for (const key of orderByDepCount[i].keys()) {
            priority.push(key)
          }
        } else {
          for (const entries of orderByDepCount[i].entries()) {
            addDep(entries, priority, depInShared)
          }
        }
      }

      function addDep([key, value], priority, depInShared) {
        for (const dep of value) {
          if (!priority.includes(dep)) {
            addDep([dep, depInShared.get(dep)], priority, depInShared)
          }
        }
        if (!priority.includes(key)) {
          priority.push(key)
        }
      }

      // adjust the map order according to priority
      provideShared.sort((a, b) => {
        const aIndex = priority.findIndex((value) => value === a[0])
        const bIndex = priority.findIndex((value) => value === b[0])
        return aIndex - bIndex
      })
      // only active when manualChunks is function,array not to solve
      if (typeof outputOption.manualChunks === 'function') {
        outputOption.manualChunks = new Proxy(outputOption.manualChunks, {
          apply(target, thisArg, argArray) {
            const id = argArray[0]
            //  if id is in shared dependencies, return id ,else return vite function value
            const find = provideShared.find((arr) =>
              arr[1].dependencies.has(id)
            )
            return find ? find[0] : target(argArray[0], argArray[1])
          }
        })
      }
      return outputOption
    },
    generateBundle: function (options, bundle) {
      for (const file in bundle) {
        const chunk = bundle[file]
        if (chunk.type === 'chunk') {
          const find = provideShared.find(
            (sharedInfo) => sharedInfo[0] === chunk.name
          )
          if (find) {
            find[1].fileName = chunk.fileName
            find[1].chunk = chunk
          }
        }
      }
      if (EXPOSES_CHUNK_SET.size && provideShared.length) {
        const sharedChunks = provideShared.map(
          (sharedInfo) => sharedInfo[1].chunk
        )
        const needShardImportChunks = [...EXPOSES_CHUNK_SET].concat(
          sharedChunks
        )
        const names = provideShared.map((sharedInfo) => {
          return { file: sharedInfo[1].fileName, name: sharedInfo[0] }
        })
        for (const chunk of needShardImportChunks) {
          const flag = chunk?.imports.find((importName) =>
            names.some(
              (item) => path.basename(item.file) === path.basename(importName)
            )
          )
          if (flag && chunk.code) {
            const ast = this.parse(chunk.code)
            const magicString = new MagicString(chunk.code)
            let modify = false
            // the processing varies according to the format
            switch (options.format) {
              case 'es':
                {
                  walk(ast, {
                    enter(node: any) {
                      if (
                        node.type === 'ImportDeclaration' &&
                        names.some((item) =>
                          item.file.endsWith(path.basename(node.source.value))
                        )
                      ) {
                        const find = provideShared.find((sharedInfo) =>
                          sharedInfo[1].fileName.endsWith(
                            path.basename(node.source.value)
                          )
                        )
                        const declaration: (string | never)[] = []
                        node.specifiers?.forEach((specify) => {
                          declaration.push(
                            `${
                              specify.imported?.name
                                ? `${
                                    specify.imported.name === specify.local.name
                                      ? specify.local.name
                                      : `${specify.imported.name}:${specify.local.name}`
                                  }`
                                : `default:${specify.local.name}`
                            }`
                          )
                        })
                        if (declaration.length) {
                          magicString.overwrite(
                            node.start,
                            node.end,
                            `const {${declaration.join(
                              ','
                            )}} = await importShared('${find?.[0]}')`
                          )
                          modify = true
                        }
                      }
                    }
                  })
                  if (modify) {
                    magicString.prepend(
                      `import {importShared} from './__rf_fn__import.js'\n`
                    )
                    chunk.code = magicString.toString()
                  }
                }
                break
              case 'system':
                {
                  walk(ast, {
                    enter(node: any) {
                      const expression = node.body[0]?.expression
                      if (
                        expression?.callee?.object?.name === 'System' &&
                        expression.callee.property?.name === 'register'
                      ) {
                        const args = expression.arguments
                        if (
                          args[0].type === 'ArrayExpression' &&
                          args[0].elements?.length > 0
                        ) {
                          const importIndex: any[] = []
                          chunk.imports.forEach((importName, index) => {
                            const equal = names.find(
                              (item) =>
                                path.basename(item.file) ===
                                path.basename(importName)
                            )
                            if (equal) {
                              importIndex.push({
                                index: index,
                                name: equal.name
                              })
                            }
                          })
                          if (
                            importIndex.length &&
                            args[1]?.type === 'FunctionExpression'
                          ) {
                            const functionExpression = args[1]
                            // const moduleAlias = functionExpression?.params[1];
                            const returnStatement =
                              functionExpression?.body?.body.find(
                                (item) => item.type === 'ReturnStatement'
                              )
                            // insert __federation_import variable
                            magicString.prependLeft(
                              returnStatement.start,
                              'var __federation_import;\n'
                            )
                            const setters =
                              returnStatement.argument.properties.find(
                                (property) => property.key.name === 'setters'
                              )
                            // insert __federation_import setter
                            magicString.appendRight(
                              setters.value.elements[chunk.imports.length - 1]
                                .end,
                              `,function (module){__federation_import=module.importShared}`
                            )
                            const execute =
                              returnStatement.argument.properties.find(
                                (property) => property.key.name === 'execute'
                              )
                            const insertPos = execute.value.body.body[0].start
                            importIndex.forEach((item) => {
                              // insert federation shared import lib
                              const varName = `__federation_${item.name}`
                              magicString.prependLeft(
                                insertPos,
                                `var  ${varName} = await __federation_import('${item.name}');\n`
                              )
                              // replace it with sharedImport
                              setters.value.elements[
                                item.index
                              ].body.body.forEach((setFn) => {
                                magicString.appendLeft(
                                  insertPos,
                                  `${setFn.expression.left.name} = ${varName}.${setFn.expression.right.property.name};\n`
                                )
                              })
                            })
                            // add async flag to execute function
                            magicString.prependLeft(
                              execute.value.start,
                              ' async '
                            )
                            // add sharedImport import declaration
                            magicString.appendRight(
                              args[0].end - 1,
                              `,'./__rf_fn__import.js'`
                            )
                            modify = true
                          }
                        }
                      }
                      // only need to process once
                      this.skip()
                    }
                  })
                  if (modify) {
                    chunk.code = magicString.toString()
                  }
                }
                break
            }
          }
        }
      }
    }
  }
  // }
}
