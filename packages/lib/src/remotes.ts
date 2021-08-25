import * as path from 'path'
import { VitePluginFederationOptions } from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { AcornNode, OutputChunk } from 'rollup'
import { PluginHooks } from '../types/pluginHooks'
import { getModuleMarker, sharedScopeCode } from './utils'
import {
  IMPORT_ALIAS,
  MODULE_NAMES,
  SHARED,
  DYNAMIC_LOADING_CSS_ALIAS,
  DYNAMIC_LOADING_CSS,
  EXPOSES_MAP
} from './public'
import { sharedMap } from './shared'
import { normalizePath, getFileName } from './utils'

export function remotesPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  const providedRemotes = options.remotes || {}
  const remotes: { id: string; config: string }[] = []
  const entryChunkSet = new Set<OutputChunk>()
  const moduleCssFileMap = new Map()
  const replaceMap = new Map()
  Object.keys(providedRemotes).forEach((id) => {
    remotes.push(Object.assign({}, { id, config: providedRemotes[id] }))
  })

  return {
    name: 'originjs:remotes',
    virtualFile: {
      __federation__: `
            const remotesMap = {
              ${remotes
                .map(
                  (remote) =>
                    `${JSON.stringify(
                      remote.id
                    )}: () => ${IMPORT_ALIAS}(${JSON.stringify(remote.config)})`
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
              MODULE_NAMES.filter((item) =>
                item.startsWith(getModuleMarker('', SHARED))
              )
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
            };`
    },
    generateBundle: function (_options, bundle) {
      const moduleFileMap = new Map()
      const cssFileMap = new Map()
      for (const file in bundle) {
        if (path.extname(file) == '.css') {
          cssFileMap.set(path.parse(path.parse(file).name).name, file)
        } else {
          moduleFileMap.set(path.parse(path.parse(file).name).name, file)
        }
      }
      cssFileMap.forEach(function (value, key) {
        if (moduleFileMap.get(key) != null) {
          moduleCssFileMap.set(moduleFileMap.get(key), value)
        }
      })

      for (const file in bundle) {
        const chunk = bundle[file]
        if (chunk.type === 'chunk' && chunk.isEntry) {
          EXPOSES_MAP.forEach((value) => {
            const replacePath = normalizePath(path.resolve(value))

            // vite + vue3
            if (
              chunk.facadeModuleId != null &&
              getFileName(normalizePath(chunk.facadeModuleId)) ===
                getFileName(replacePath)
            ) {
              replaceMap.set(replacePath, `./${chunk.fileName}`)
            }
          })
          entryChunkSet.add(chunk)
        }
      }

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

        // replace __f__dynamic_loading_css__ to dynamicLoadingCss
        moduleCssFileMap.forEach((value, key) => {
          item.code = item.code.replace(
            `${DYNAMIC_LOADING_CSS_ALIAS}("./${key}")`,
            `${DYNAMIC_LOADING_CSS}("${value}")`
          )
          item.code = item.code.replace(
            `${DYNAMIC_LOADING_CSS_ALIAS}('./${key}')`,
            `${DYNAMIC_LOADING_CSS}('${value}')`
          )
        })

        // remove all __f__dynamic_loading_css__ after replace
        while (item.code.indexOf(`${DYNAMIC_LOADING_CSS_ALIAS}`) > -1) {
          const magicString = new MagicString(item.code)
          magicString.remove(
            item.code.indexOf(`${DYNAMIC_LOADING_CSS_ALIAS}`),
            item.code.indexOf(
              '\n',
              item.code.indexOf(`${DYNAMIC_LOADING_CSS_ALIAS}`)
            )
          )
          item.code = magicString.toString()
        }
      })
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
        map: null
      }
    }
  }
}
