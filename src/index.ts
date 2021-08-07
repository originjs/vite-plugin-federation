import * as path from 'path'
import { OutputChunk, Plugin, AcornNode } from 'rollup'
import virtual from '@rollup/plugin-virtual'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { sharedAssign } from './util/objectUtil'

export default function federation(
  options: VitePluginFederationOptions
): Plugin {
  const remoteEntryHelperId = 'rollup-plugin-federation/remoteEntry'
  const modulePrefix = '__ROLLUP_FEDERATION_MODULE_PREFIX__'
  const replaceMap = new Map()
  const moduleNames: string[] = []
  const provideExposes = options.exposes || {}
  const shared = sharedAssign(options.shared || [])
  let moduleMap = ''
  const exposesMap = new Map()
  for (const key in provideExposes) {
    if (Object.prototype.hasOwnProperty.call(provideExposes, key)) {
      const moduleName = `${modulePrefix + '${' + provideExposes[key] + '}'}`
      moduleNames.push(moduleName)
      moduleNames.push(key)
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

  const providedRemotes = (options.remotes || {}) as { [index: string]: string }
  const remotes: { id: string; config: string }[] = []
  Object.keys(providedRemotes).forEach((id) => {
    remotes.push(Object.assign({}, { id, config: providedRemotes[id] }))
  })

  const virtualMod = virtual({
    __federation__: `
const remotesMap = {
  ${remotes
    .map(
      (remote) =>
        `${JSON.stringify(remote.id)}: () => import(${JSON.stringify(
          remote.config
        )})`
    )
    .join(',\n  ')}
};

const processModule = (mod) => {
  if (mod && mod.__useDefault) {
    return mod.default;
  }

  return mod;
}

const shareScope = {
  
};

const initMap = {};

export default {
  ensure: async (remoteId) => {
    const remote = await remotesMap[remoteId]();

    if (!initMap[remoteId]) {
      remote.init(shareScope);
      initMap[remoteId] = true;
    }

    return remote;
  }
};`
  })

  return {
    name: 'federation',

    options(_options) {
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
      // use external to suppress import warning
      _options.external = _options.external || []
      if (!Array.isArray(_options.external)) {
        _options.external = [_options.external as string]
      }
      moduleNames.forEach((item) => (_options.external as string[]).push(item))
      // remove from external what is both in shared and external
      if (shared.size) {
        _options.external = _options.external.filter((item) => {
          return !shared.has(item as string)
        })
      }
      return _options
    },

    buildStart() {
      // if it dont exposes anything,unnecessary to emitFile
      if (Object.keys(provideExposes).length) {
        this.emitFile({
          fileName: options.filename,
          type: 'chunk',
          id: remoteEntryHelperId,
          preserveSignature: 'strict'
        })
      }
    },

    resolveId(...args) {
      const [source] = args
      if (source === remoteEntryHelperId) {
        return source
      }
      const v = virtualMod.resolveId.call(this, ...args)
      if (v) {
        return v
      }
      return null
    },

    load(...args) {
      const [id] = args
      if (id === remoteEntryHelperId && Object.keys(provideExposes).length) {
        return {
          code,
          moduleSideEffects: 'no-treeshake'
        }
      }
      const v = virtualMod.load.call(this, ...args)
      if (v) {
        return v
      }
      return null
    },

    generateBundle(_options, bundle) {
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
    },
    transform(code: string) {
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
              const remote = remotes.find((r) => moduleId.startsWith(r.id))

              if (remote) {
                requiresRuntime = true
                const modName = `.${moduleId.slice(remote.id.length)}`

                magicString.overwrite(
                  node.start,
                  node.end,
                  `__federation__.ensure(${JSON.stringify(
                    remote.id
                  )}).then((remote) => remote.get(${JSON.stringify(modName)}))`
                )
              }
            }
          }
        }
      })

      if (requiresRuntime) {
        magicString.prepend(`import __federation__ from '__federation__';\n\n`)
      }

      return {
        code: magicString.toString(),
        // map: sourceMap ? magicString.generateMap({ hires: true }) : null,
        map: null
      }
    },
    outputOptions(options) {
      // add shared content into manualChunk
      if (shared.size) {
        options.manualChunks = options.manualChunks || {}
        shared.forEach((value, key) => {
          if (options.manualChunks) {
            //TODO need to support more type
            options.manualChunks[key] = [key]
          }
        })
      }
      return options
    }
  }
}
