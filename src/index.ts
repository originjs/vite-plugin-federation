import * as path from 'path'
import { OutputChunk, Plugin, AcornNode } from 'rollup'
import virtual from '@rollup/plugin-virtual'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { sharedAssign, sharedScopeCode } from './util/objectUtil'
import { VitePluginFederationOptions } from '../types'

function getModuleMarker(value: string, type?: string): string {
  return type
    ? `__ROLLUP_FEDERATION_${type.toUpperCase()}_PREFIX__${value}`
    : `__ROLLUP_FEDERATION_MODULE_PREFIX__${value}`
}

export default function federation(
  options: VitePluginFederationOptions
): Plugin {
  const SHARED = 'shared'
  const VARIABLE = 'variable'
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
        global.__ROLLUP_FEDERATION_VARIABLE_PREFIX__shared= shareScope
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
      const provinceChunk: OutputChunk[] = []
      const replaceMap = new Map()
      const chunkMap = new Map()
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
                  provinceChunk.push(chunk)
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
                chunkMap.set(chunk.fileName, chunk.name)
              }
            }
          }
        }
      }
      entryChunk.forEach((item) => {
        replaceMap.forEach((value, key) => {
          item.code = item.code.replace(key, value)
        })
      })
      if (provinceChunk.length) {
        const GLOBAL_VARIABLE = getModuleMarker('global', VARIABLE)
        const SHARED_VARIABLE = getModuleMarker(SHARED, VARIABLE)
        const CACHE_VARIABLE = getModuleMarker('cache', VARIABLE)
        const MODULES_VARIABLE = getModuleMarker('modules', VARIABLE)
        const MODULES_MAP_VARIABLE = getModuleMarker('modulesMap', VARIABLE)
        provinceChunk.forEach((chunk) => {
          const nodes: any[] = []
          const astCode = this.parse(chunk.code)
          const magicString = new MagicString(chunk.code)
          const as: any[] = []
          let importCount = 0
          const sourceImportMap = new Map()
          walk(astCode, {
            enter(node: any) {
              if (node.type === 'ImportDeclaration') {
                const key = path.basename(node.source.value)
                if (chunkMap.has(key)) {
                  sourceImportMap.set(chunkMap.get(key), {
                    source: node.source.value,
                    space: node.specifiers
                  })
                  node.specifiers.forEach((imp) => {
                    as.push({
                      name: imp.imported.name,
                      import: chunkMap.get(key),
                      local: imp.local.name
                    })
                  })
                  magicString.overwrite(node.start, node.end, '')
                }
                nodes.push(node)
              }
            }
          })
          const code = ` 
                
                ${[...sourceImportMap.values()]
                  .map((item) => {
                    let str = ''
                    item.space.forEach((spec) => {
                      str += `let ${spec.local.name}= null;`
                    })
                    return str
                  })
                  .join('')}
                ${
                  importCount++ > 0
                    ? ''
                    : `let ${GLOBAL_VARIABLE}= window || node;`
                }
                                const ${CACHE_VARIABLE}= {}
                                const ${MODULES_VARIABLE}= ${JSON.stringify([
            ...chunkMap.values()
          ])}
                                const ${MODULES_MAP_VARIABLE}= {${[
            ...sourceImportMap.keys()
          ]
            .map((item) => {
              return `${JSON.stringify(item)}:${JSON.stringify(
                sourceImportMap.get(item).source
              )}`
            })
            .join(',')}}
                
                                
                                for (let i = 0; i < ${MODULES_VARIABLE}.length; i++) {
                                    if(${GLOBAL_VARIABLE}?.${SHARED_VARIABLE}&& ${GLOBAL_VARIABLE}.${SHARED_VARIABLE}[${MODULES_VARIABLE}[i]]){
                                        ${CACHE_VARIABLE}[${MODULES_VARIABLE}[i]]=  await ${GLOBAL_VARIABLE}.${SHARED_VARIABLE}[${MODULES_VARIABLE}[i]].get();
                                }else {
                                    ${CACHE_VARIABLE}[${MODULES_VARIABLE}[i]]=await import(${MODULES_MAP_VARIABLE}[${MODULES_VARIABLE}[i]])
                                }
                                
                                }
                           ${as
                             .map((item) => {
                               return `${item.local} = ${CACHE_VARIABLE}['${item.import}']['${item.name}']`
                             })
                             .join(';')}     
             
              `
          // magicString.overwrite(nodes[nodes.length - 1].start, nodes[nodes.length - 1].end, code);
          const lastImport = nodes[nodes.length - 1]
          // if(chunkMap.has(path.basename(lastImport.source.value))){
          //     magicString.overwrite(lastImport.start , lastImport.end , code);
          // }else {
          magicString.appendRight(lastImport.end, code)
          // }
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
