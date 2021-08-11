import * as path from 'path'
import { OutputChunk, Plugin, AcornNode } from 'rollup'
import virtual from '@rollup/plugin-virtual'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { sharedAssign, sharedScopeCode } from './util/objectUtil'
import { VitePluginFederationOptions } from '../types'

function getModuleMarker(value: string, type?: string): string {
  return type ? `__rf_${type}__${value}` : `__rf_placeholder__${value}`
}

export default function federation(
  options: VitePluginFederationOptions
): Plugin {
  const SHARED = 'shared'
  const moduleNames: string[] = []
  const provideExposes = options.exposes || {}
  const externals: string[] = []
  const shared = sharedAssign(options.shared || [])
  let moduleMap = ''
  const exposesMap = new Map()
  // exposes module
  for (const key in provideExposes) {
    if (Object.prototype.hasOwnProperty.call(provideExposes, key)) {
      const moduleName = getModuleMarker(`\${${key}}`, SHARED)
      externals.push(moduleName)
      externals.push(key)
      const exposeFilepath = path
        .resolve(provideExposes[key])
        .replace(/\\/g, '/')
      exposesMap.set(key, exposeFilepath)
      moduleMap += `\n"${key}":()=>{return import('${exposeFilepath}')},`
    }
  }
  // shared module
  shared.forEach((value, key) => {
    const sharedModuleName = getModuleMarker(`\${${key}}`, SHARED)
    externals.push(sharedModuleName)
    moduleNames.push(sharedModuleName)
  })

  const providedRemotes = options.remotes || {}
  const remotes: { id: string; config: string }[] = []
  Object.keys(providedRemotes).forEach((id) => {
    remotes.push(Object.assign({}, { id, config: providedRemotes[id] }))
  })

  const virtualMod = virtual({
    // code generated for host
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
${sharedScopeCode(
  shared,
  moduleNames.filter((item) => item.startsWith(getModuleMarker('', SHARED)))
).join(',')} 
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
};`,
    // code generated for remote
    __remoteEntryHelper__: `let moduleMap = {${moduleMap}}
    export const get =(module, getScope) => {
        return moduleMap[module]();
    };
    export const init =(shareScope, initScope) => {
        let global = window || node;
        global.${getModuleMarker('shared', 'var')}= shareScope
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
      _options.external = _options.external.concat(externals)
      // remove from external what is both in shared and external
      if (shared.size > 0) {
        _options.external = _options.external.filter((item) => {
          return !shared.has(item as string)
        })
      }
      return _options
    },

    buildStart() {
      // if we don't expose any modules, there is no need to emit file
      if (Object.keys(provideExposes).length) {
        this.emitFile({
          fileName: options.filename,
          type: 'chunk',
          id: '__remoteEntryHelper__',
          preserveSignature: 'strict'
        })
      }
    },

    resolveId(...args) {
      const v = virtualMod.resolveId.call(this, ...args)
      if (v) {
        return v
      }
      return null
    },

    load(...args) {
      const v = virtualMod.load.call(this, ...args)
      if (v) {
        return v
      }
      return null
    },

    generateBundle: function (_options, bundle) {
      const entryChunk: OutputChunk[] = []
      const exposesChunk: OutputChunk[] = []
      const replaceMap = new Map()
      const sharedChunkMap = new Map()
      for (const file in bundle) {
        if (Object.prototype.hasOwnProperty.call(bundle, file)) {
          const chunk = bundle[file]
          if (chunk.type === 'chunk') {
            if (chunk.isEntry) {
              exposesMap.forEach((value) => {
                if (chunk.facadeModuleId!.indexOf(path.resolve(value)) >= 0) {
                  replaceMap.set(
                    getModuleMarker(`\${${value}}`),
                    `http://localhost:8081/${chunk.fileName}`
                  )
                  exposesChunk.push(chunk)
                }
                // if (options.filename === chunk.fileName) {
                //     remoteChunk = chunk
                // }
              })
              entryChunk.push(chunk)
            } else {
              //  shared path replace
              if (shared.has(chunk.name)) {
                replaceMap.set(
                  getModuleMarker(`\${${chunk.name}}`, SHARED),
                  `/${_options.dir}/${chunk.fileName}`
                )
                sharedChunkMap.set(chunk.fileName, chunk.name)
              }
            }
          }
        }
      }
      // placeholder replace
      entryChunk.forEach((item) => {
        replaceMap.forEach((value, key) => {
          item.code = item.code.replace(key, value)
        })
      })
      // collect import info
      if (exposesChunk.length) {
        const FN_IMPORT = getModuleMarker('import', 'fn')
        const VAR_GLOBAL = getModuleMarker('global', 'var')
        const VAR_MODULE_MAP = getModuleMarker('moduleMap', 'var')
        const VAR_SHARED = getModuleMarker('shared', 'var')
        exposesChunk.forEach((chunk) => {
          let lastImport: any = null
          const ast = this.parse(chunk.code)
          const importMap = new Map()
          const magicString = new MagicString(chunk.code)
          walk(ast, {
            enter(node: any) {
              if (node.type === 'ImportDeclaration') {
                const key = path.basename(node.source.value)
                if (sharedChunkMap.has(key)) {
                  importMap.set(sharedChunkMap.get(key), {
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
                        if (${VAR_GLOBAL}?.${VAR_SHARED} && ${VAR_GLOBAL}.${VAR_SHARED}[name]) {
                            return await ${VAR_GLOBAL}.${VAR_SHARED}[name].get();
                        } else {
                            return await import(${VAR_MODULE_MAP}[name])
                        }
                    }`

          if (lastImport) {
            //  append code after lastImport
            magicString.appendRight(lastImport.end, dynamicCode)
          }
          chunk.code = magicString.toString()
        })
      }
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
