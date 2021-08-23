import * as path from 'path'
import { AcornNode } from 'rollup'
import { Plugin as vitePlugin } from 'vite'
import virtual from '@rollup/plugin-virtual'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import shared, { sharedMap } from './shared'
import { entryChunkSet, exposesChunkSet, IMPORT_ALIAS } from './public'
import {
  getModuleMarker,
  parseOptions,
  removeNonLetter,
  sharedScopeCode,
  normalizePath,
  getFileName
} from './utils'
import { VitePluginFederationOptions } from '../types'
import { replaceMap, SHARED } from './public'

export default function federation(
  options: VitePluginFederationOptions
): vitePlugin {
  // sharedPlugin ..
  const selfPlugin = [shared]
  for (const pluginHook of selfPlugin) {
    pluginHook.init?.(options)
  }
  const moduleNames: string[] = []
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

  const externals: string[] = []
  let moduleMap = ''
  const exposesMap = new Map()
  // exposes module
  for (const item of provideExposes) {
    const moduleName = getModuleMarker(`\${${item[0]}}`, SHARED)
    externals.push(moduleName)
    externals.push(item[0])
    const exposeFilepath = path.resolve(item[1].import).replace(/\\/g, '/')
    exposesMap.set(item[0], exposeFilepath)
    moduleMap += `\n"${item[0]}":()=>{return ${IMPORT_ALIAS}('${exposeFilepath}')},`
  }
  // shared module
  sharedMap.forEach((value, key) => {
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
  sharedMap,
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
    name: 'originjs:federation',
    options(_options) {
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

      for (const pluginHook of selfPlugin) {
        pluginHook.options?.call(this, _options)
      }
      return _options
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

      for (const pluginHook of selfPlugin) {
        pluginHook.buildStart?.call(this, inputOptions)
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
    outputOptions(outputOptions) {
      for (const pluginHook of selfPlugin) {
        pluginHook.outputOptions?.call(this, outputOptions)
      }
      return outputOptions
    },

    renderChunk(code, chunkInfo, _options) {
      for (const pluginHook of selfPlugin) {
        pluginHook.renderChunk?.call(this, code, chunkInfo, _options)
      }
      return null
    },

    generateBundle: function (_options, bundle) {
      for (const file in bundle) {
        const chunk = bundle[file]
        if (chunk.type === 'chunk' && chunk.isEntry) {
          exposesMap.forEach((value) => {
            const replacePath = normalizePath(path.resolve(value))
            console.log(chunk.facadeModuleId)
            console.log(replacePath)
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

      shared.generateBundle?.call(this, _options, bundle)
    },

    transform(code: string, id: string) {
      if (remotes.length === 0 || id.includes('node_modules')) {
        return null
      }
      if (!/import/.test(code)) {
        return null
      }

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
    }
  }
}
