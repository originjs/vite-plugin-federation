import { PluginHooks } from '../types/pluginHooks'
import { getModuleMarker, sharedAssign } from './utils'
import {
  entryChunkSet,
  exposesChunkSet,
  IMPORT_ALIAS,
  replaceMap,
  SHARED
} from './public'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'
import path from 'path'

let sharedMap = new Map()
const shared: PluginHooks = {
  init: (config) => {
    sharedMap = sharedAssign(config.shared || [])
  },

  options(inputOptions) {
    if (sharedMap.size) {
      // remove item which is both in external and shared
      inputOptions.external = (inputOptions.external as [])?.filter((item) => {
        return !sharedMap.has(item)
      })
      // add shared content into input
      sharedMap.forEach((value, key) => {
        inputOptions.input![`${getModuleMarker(key, 'input')}`] = key
      })
    }
    return inputOptions
  },

  renderChunk: (code, chunkInfo) => {
    const name = chunkInfo.name
    if (chunkInfo.isEntry) {
      const sharedName = name.match(/(?<=__rf_input__).*/)?.[0]
      if (sharedName) {
        sharedMap
          .get(sharedName)
          ?.set(
            'fileName',
            chunkInfo.imports?.length === 1 &&
              !Object.keys(chunkInfo.modules).length
              ? chunkInfo.imports[0]
              : chunkInfo.fileName
          )
      }
    }
    return null
  },

  generateBundle: function (options, bundle) {
    sharedMap.forEach((value, key) => {
      let realFileName = value.get('fileName')
      if (realFileName && !realFileName.startsWith('__rf_input')) {
        const expectFileName = `__rf_input__${key}.js`
        // delete non-used chunk
        delete bundle[expectFileName]
        //  rename chunk
        bundle[realFileName].fileName = expectFileName
        replaceMap.set(realFileName, expectFileName)
        realFileName = expectFileName
        value.set('fileName', realFileName)
      }
      // shared path replace, like __rf_shared__react => /dist/react.js
      replaceMap.set(
        getModuleMarker(`\${${key}}`, SHARED),
        `/${options.dir}/${realFileName}`
      )
    })
    // placeholder replace
    entryChunkSet.forEach((item) => {
      item.code = item.code.split(IMPORT_ALIAS).join('import')

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
export default shared
export { sharedMap }
