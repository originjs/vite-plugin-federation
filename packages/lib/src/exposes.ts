import * as path from 'path'
import {
  parseOptions,
  getModuleMarker,
  removeNonLetter,
  normalizePath,
  getFileName
} from './utils'
import {
  externals,
  replaceMap,
  IMPORT_ALIAS,
  SHARED,
  exposesChunkSet,
  entryChunkSet
} from './public'
import { InputOptions, MinimalPluginContext } from 'rollup'
import { VitePluginFederationOptions } from 'types'
import { PluginHooks } from '../types/pluginHooks'

export function exposesPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  let moduleMap = ''
  const exposesMap = new Map()
  const provideExposes = parseOptions(
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
  // exposes module
  for (const item of provideExposes) {
    const moduleName = getModuleMarker(`\${${item[0]}}`, SHARED)
    externals.push(moduleName)
    externals.push(item[0])
    const exposeFilepath = path.resolve(item[1].import).replace(/\\/g, '/')
    exposesMap.set(item[0], exposeFilepath)
    moduleMap += `\n"${item[0]}":()=>{return ${IMPORT_ALIAS}('${exposeFilepath}')},`
  }

  return {
    name: 'originjs:exposes',
    virtualFile: {
      // code generated for remote
      __remoteEntryHelper__: `let moduleMap = {${moduleMap}}
    export const get =(module, getScope) => {
        return moduleMap[module]();
    };
    export const init =(shareScope, initScope) => {
        let global = window || node;
        global.${getModuleMarker('shared', 'var')}= shareScope
    };`
    },
    options(
      this: MinimalPluginContext,
      _options: InputOptions
    ):
      | Promise<InputOptions | null | undefined>
      | InputOptions
      | null
      | undefined {
      // Split expose & shared module to separate chunks
      _options.preserveEntrySignatures = 'strict'
      if (typeof _options.input === 'string') {
        _options.input = { index: _options.input }
      }
      exposesMap.forEach((value, key) => {
        _options.input![removeNonLetter(key)] = value
      })
      // use external to suppress import warning
      _options.external = _options.external || []
      if (!Array.isArray(_options.external)) {
        _options.external = [_options.external as string]
      }
      _options.external = _options.external.concat(externals)
      return null
    },

    buildStart(inputOptions) {
      // if we don't expose any modules, there is no need to emit file
      if (provideExposes.length > 0) {
        this.emitFile({
          fileName: options.filename,
          type: 'chunk',
          id: '__remoteEntryHelper__',
          preserveSignature: 'strict'
        })
      }
    },

    generateBundle: function (_options, bundle) {
      for (const file in bundle) {
        const chunk = bundle[file]
        if (chunk.type === 'chunk' && chunk.isEntry) {
          exposesMap.forEach((value) => {
            const replacePath = normalizePath(path.resolve(value))
            if (!exposesChunkSet.has(chunk)) {
              // vite + vue3
              if (
                chunk.facadeModuleId != null &&
                getFileName(normalizePath(chunk.facadeModuleId)) ===
                  getFileName(replacePath)
              ) {
                replaceMap.set(replacePath, `./${chunk.fileName}`)
                exposesChunkSet.add(chunk)
              }
            }
          })
          entryChunkSet.add(chunk)
        }
      }
    }
  }
}
