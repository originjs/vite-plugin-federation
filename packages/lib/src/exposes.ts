import * as path from 'path'
import {
  parseOptions,
  getModuleMarker,
  removeNonLetter,
  normalizePath,
  getFileName
} from './utils'
import {
  EXTERNALS,
  IMPORT_ALIAS,
  DYNAMIC_LOADING_CSS_ALIAS,
  SHARED,
  EXPOSES_CHUNK_SET,
  EXPOSES_MAP
} from './public'
import { InputOptions, MinimalPluginContext } from 'rollup'
import { VitePluginFederationOptions } from 'types'
import { PluginHooks } from '../types/pluginHooks'

export function exposesPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  let moduleMap = ''
  const replaceMap = new Map()
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
    EXTERNALS.push(moduleName)
    EXTERNALS.push(item[0])
    const exposeFilepath = path.resolve(item[1].import).replace(/\\/g, '/')
    EXPOSES_MAP.set(item[0], exposeFilepath)
    moduleMap += `\n"${item[0]}":()=>{
      ${DYNAMIC_LOADING_CSS_ALIAS}('${exposeFilepath}')
      return ${IMPORT_ALIAS}('${exposeFilepath}')
    },`
  }

  return {
    name: 'originjs:exposes',
    virtualFile: {
      // code generated for remote
      __remoteEntryHelper__: `let moduleMap = {${moduleMap}}
    export const dynamicLoadingCss = (cssFilePath) => {
      const metaUrl = import.meta.url
      if (typeof metaUrl == 'undefined') {
        console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".')
        return
      }
      const curUrl = metaUrl.substring(0, metaUrl.lastIndexOf('remoteEntry.js'))
      const element = document.head.appendChild(document.createElement('link'))
      element.href = curUrl + cssFilePath
      element.rel = 'stylesheet'
    }

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
      EXPOSES_MAP.forEach((value, key) => {
        _options.input![removeNonLetter(key)] = value
      })
      EXTERNALS.forEach((item) => {
        if (Array.isArray(_options.external)) {
          _options.external.push(item)
        }
      })
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
          EXPOSES_MAP.forEach((value) => {
            const replacePath = normalizePath(path.resolve(value))
            if (!EXPOSES_CHUNK_SET.has(chunk)) {
              // vite + vue3
              if (
                chunk.facadeModuleId != null &&
                getFileName(normalizePath(chunk.facadeModuleId)) ===
                  getFileName(replacePath)
              ) {
                replaceMap.set(replacePath, `./${chunk.fileName}`)
                EXPOSES_CHUNK_SET.add(chunk)
              }
            }
          })
        }
      }
      for (const fileKey in bundle) {
        const chunk = bundle[fileKey]
        replaceMap.forEach((value, key) => {
          if (chunk.type === 'chunk') {
            chunk.code = chunk.code.replace(key, value)
          }
        })
      }
    }
  }
}
