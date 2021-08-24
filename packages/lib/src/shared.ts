import { PluginHooks } from '../types/pluginHooks'
import { getModuleMarker, sharedAssign } from './utils'
import {
  entryChunkSet,
  exposesChunkSet,
  externals,
  IMPORT_ALIAS,
  moduleNames,
  replaceMap,
  SHARED
} from './public'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'
import path from 'path'
import { VitePluginFederationOptions } from 'types'

export const sharedMap: Map<string, Map<string, any>> = new Map()

export function sharedPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  sharedAssign(sharedMap, options.shared || [])
  sharedMap.forEach((value, key) => {
    const sharedModuleName = getModuleMarker(`\${${key}}`, SHARED)
    externals.push(sharedModuleName)
    moduleNames.push(sharedModuleName)
  })

  return {
    name: 'originjs:shared',

    options(inputOptions) {
      if (sharedMap.size) {
        // remove item which is both in external and shared
        inputOptions.external = (inputOptions.external as [])?.filter(
          (item) => {
            return !sharedMap.has(item)
          }
        )
        // add shared content into input
        sharedMap.forEach((value, key) => {
          inputOptions.input![`${getModuleMarker(key, 'input')}`] = key
        })
      }
      return inputOptions
    },

    async buildStart(options) {
      for (const entry of sharedMap) {
        const key = entry[0]
        const value = entry[1]
        value.set('idRegexp', RegExp(`node_modules[/\\\\]@?${key}[/\\\\]`))
        value.set('id', await this.resolveId(key))
      }
    },

    outputOptions(outputOption) {
      outputOption.manualChunks = outputOption.manualChunks || {}
      if (typeof outputOption.manualChunks === 'function') {
        //  proxy this function and add shared
        outputOption.manualChunks = new Proxy(outputOption.manualChunks, {
          apply(target, thisArg, argArray) {
            const id = argArray[0]
            //  if id is in shareMap , return id ,else return vite function value
            const find = [...sharedMap.entries()].find((item) =>
              id.match(item[1].get('idRegexp'))
            )
            return find ? find[0] : target(argArray[0], argArray[1])
          }
        })
      } else {
        // add shared to manualChunks, such as vue:['vue']
        sharedMap.forEach((value, key) => {
          if (outputOption.manualChunks) {
            outputOption.manualChunks[key] = [key]
          }
        })
      }
      return outputOption
    },

    renderChunk: (code, chunkInfo) => {
      const name = chunkInfo.name
      if (chunkInfo.isEntry) {
        const sharedName = name.match(/(?<=__rf_input__).*/)?.[0]
        if (sharedName) {
          const filePath =
            chunkInfo.imports?.length === 1 &&
            !Object.keys(chunkInfo.modules).length
              ? chunkInfo.imports[0]
              : chunkInfo.fileName
          const fileName = path.basename(filePath)
          const fileDir = path.dirname(filePath)
          const sharedProp = sharedMap.get(sharedName)
          sharedProp?.set('fileName', fileName)
          sharedProp?.set('fileDir', fileDir)
          sharedProp?.set('filePath', filePath)
        }
      }
      return null
    },

    generateBundle: function (options, bundle) {
      const importReplaceMap = new Map()
      sharedMap.forEach((value, key) => {
        const fileName = value.get('fileName')
        const fileDir = value.get('fileDir')
        let filePath = value.get('filePath')
        if (filePath && !fileName.startsWith('__rf_input')) {
          const expectName = `__rf_input__${key}`
          let expectFileName = ''
          // find expectName
          for (const file in bundle) {
            if (bundle[file].name === expectName) {
              expectFileName = path.basename(bundle[file].fileName)
            }
          }
          expectFileName = expectFileName ? expectFileName : `${expectName}.js`
          // rollup fileName
          const expectFilePath = `${fileDir}/${expectFileName}`
          // delete non-used chunk
          delete bundle[expectFilePath]
          //  rename chunk
          bundle[expectFilePath] = bundle[filePath]
          bundle[expectFilePath].fileName = expectFilePath
          delete bundle[filePath]
          replaceMap.set(fileName, expectFileName)
          importReplaceMap.set(filePath, expectFilePath)
          filePath = expectFilePath
          value.set('filePath', expectFilePath)
          value.set('fileName', expectFileName)
        }
        // shared path replace, like __rf_shared__react => /dist/react.js
        replaceMap.set(
          getModuleMarker(`\${${key}}`, SHARED),
          `/${options.dir}/${filePath}`
        )
      })

      // replace every chunk import
      importReplaceMap.forEach((value, key) => {
        for (const fileKey in bundle) {
          const chunk = bundle[fileKey]
          if (chunk.type === 'chunk') {
            const indexOf = chunk.imports?.indexOf(key)
            if (indexOf >= 0) {
              chunk[indexOf] = value
            }
          }
        }
      })

      // placeholder replace
      entryChunkSet.forEach((item) => {
        item.code = item.code.split(IMPORT_ALIAS).join('import')

        // accurately replace import absolute path to relative path
        replaceMap.forEach((value, key) => {
          item.code = item.code.replace(`('${key}')`, `('${value}')`)
          item.code = item.code.replace(`("${key}")`, `("${value}")`)
        })

        // replace __rf_shared__xxx
        replaceMap.forEach((value, key) => {
          item.code = item.code.replace(key, value)
          const index = item.imports.indexOf(key)
          if (index >= 0) {
            // replace chunk.imports property
            item.imports[index] = value
          }
        })
      })

      if (exposesChunkSet.size) {
        const FN_IMPORT = getModuleMarker('import', 'fn')
        const VAR_GLOBAL = getModuleMarker('global', 'var')
        const VAR_MODULE_MAP = getModuleMarker('moduleMap', 'var')
        const VAR_SHARED = getModuleMarker('shared', 'var')
        const fileName2SharedName = new Map()
        sharedMap.forEach((value, key) => {
          fileName2SharedName.set(value.get('fileName'), key)
        })
        exposesChunkSet.forEach((chunk) => {
          let lastImport: any = null
          const ast = this.parse(chunk.code)
          const importMap = new Map()
          const magicString = new MagicString(chunk.code)
          walk(ast, {
            enter(node: any) {
              if (node.type === 'ImportDeclaration') {
                const fileName = path.basename(node.source.value)
                const sharedName = fileName2SharedName.get(fileName)
                if (sharedName) {
                  importMap.set(sharedName, {
                    source: node.source.value,
                    specifiers: node.specifiers
                  })
                  //  replace import with empty
                  magicString.overwrite(node.start, node.end, '')
                }
                // record the last import to insert dynamic import code
                lastImport = node
              }
            }
          })
          //  generate variable declare
          const PLACEHOLDER_VAR = [...importMap.keys()]
            .map((item) => {
              let str = ''
              importMap.get(item).specifiers?.forEach((space) => {
                str += `let ${space.local.name} = (await ${FN_IMPORT}('${item}'))['${space.imported.name}'] \n`
              })
              return str
            })
            .join('')

          //    generate variable moduleMap declare
          const PLACEHOLDER_MODULE_MAP = `{${[...importMap.keys()]
            .map((item) => {
              return `'${item}':'${importMap.get(item).source}'`
            })
            .join(',')}}`
          // all insert code
          const dynamicCode = `\n
                    ${PLACEHOLDER_VAR}
                    async function ${FN_IMPORT} (name) {
                        let ${VAR_GLOBAL} = window || node;
                        const ${VAR_MODULE_MAP} = ${PLACEHOLDER_MODULE_MAP}
                        if (${VAR_GLOBAL}.${VAR_SHARED}?.[name]) {
							if (!${VAR_GLOBAL}.${VAR_SHARED}[name].lib) {
								${VAR_GLOBAL}.${VAR_SHARED}[name].lib = await (${VAR_GLOBAL}.${VAR_SHARED}[name].get())
							}
							return ${VAR_GLOBAL}.${VAR_SHARED}[name].lib;
						} else {
							return import(${VAR_MODULE_MAP}[name])
						}
                      }`

          if (lastImport) {
            //  append code after lastImport
            magicString.appendRight(lastImport.end, dynamicCode)
          }
          chunk.code = magicString.toString()
        })
      }
    }
  }
}
