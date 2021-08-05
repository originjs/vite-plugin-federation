import * as path from 'path'
import { InputOptions, OutputBundle, OutputChunk, OutputOptions } from 'rollup'

export default function federation(options: VitePluginFederationOptions) {
  const remoteEntryHelperId = 'rollup-plugin-federation/remoteEntry'
  const modulePrefix = '__ROLLUP_FEDERATION_MODULE_PREFIX__'
  const replaceMap = new Map()
  const moduleNames: string[] = []
  const provideExposes = options.exposes as string[]
  let moduleMap = ''
  const exposesMap = new Map()
  for (const key in provideExposes) {
    if (Object.prototype.hasOwnProperty.call(provideExposes, key)) {
      const moduleName = `${modulePrefix + '${' + provideExposes[key] + '}'}`
      moduleNames.push(moduleName)
      exposesMap.set(key, provideExposes[key])
      moduleMap += `\n"${key}":()=>{return import('${moduleName}')},`
    }
  }
  const code = `let moduleMap = {${moduleMap}}
export const get =(module, getScope) => {
    return moduleMap[module]();
};
export const init =(shareScope, initScope) => {
    console.log('init')
};`

  return {
    name: 'federation',

    options(_options: InputOptions) {
      // Split expose & shared module to separate chunks
      _options.preserveEntrySignatures = 'strict'
      if (typeof _options.input === 'string') {
        _options.input = [_options.input]
      }
      exposesMap.forEach((value) => {
        if (Array.isArray(_options.input)) {
          _options.input.push(value)
        }
      })
      // suppress import warning
      if (_options.external && !Array.isArray(_options.external)) {
        _options.external = [_options.external as string]
      }
      moduleNames.forEach((item) => (_options.external as string[]).push(item))
      return _options
    },

    buildStart(_options: InputOptions) {
      this.emitFile({
        fileName: options.filename,
        type: 'chunk',
        id: remoteEntryHelperId,
        preserveSignature: 'strict'
      })
    },

    resolveId(source: string, importer: string) {
      if (source === remoteEntryHelperId) return source
      return null
    },

    load(id: string) {
      if (id === remoteEntryHelperId) {
        return {
          code,
          moduleSideEffects: 'no-treeshake'
        }
      }
      return null
    },

    generateBundle(_options: OutputOptions, bundle: OutputBundle) {
      let remoteChunk: OutputChunk
      for (const file in bundle) {
        if (Object.prototype.hasOwnProperty.call(bundle, file)) {
          const chunk = bundle[file]
          if (chunk.type === 'chunk' && chunk.isEntry) {
            exposesMap.forEach((value) => {
              if (chunk.facadeModuleId!.indexOf(path.resolve(value)) >= 0) {
                replaceMap.set(
                  modulePrefix + '${' + value + '}',
                  `http://localhost:8081/${chunk.fileName}`
                )
              }
              if (options.filename === chunk.fileName) {
                remoteChunk = chunk
              }
            })
          }
        }
      }
      replaceMap.forEach((value, key) => {
        remoteChunk.code = (remoteChunk.code as string).replace(key, value)
      })
    }
  }
}
