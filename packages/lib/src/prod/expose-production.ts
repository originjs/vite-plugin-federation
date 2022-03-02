import { resolve, parse, basename, extname } from 'path'
import { getModuleMarker, normalizePath, parseExposeOptions } from '../utils'
import {
  builderInfo,
  DYNAMIC_LOADING_CSS,
  DYNAMIC_LOADING_CSS_PREFIX,
  EXPOSES_MAP,
  EXTERNALS,
  parsedOptions,
  SHARED
} from '../public'
import type { AcornNode } from 'rollup'
import type { VitePluginFederationOptions } from 'types'
import type { PluginHooks } from '../../types/pluginHooks'
import MagicString from 'magic-string'
import { walk } from 'estree-walker'

export function prodExposePlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  let moduleMap = ''
  parsedOptions.prodExpose = parseExposeOptions(options)
  // exposes module
  for (const item of parsedOptions.prodExpose) {
    const moduleName = getModuleMarker(`\${${item[0]}}`, SHARED)
    EXTERNALS.push(moduleName)
    const exposeFilepath = normalizePath(resolve(item[1].import))
    EXPOSES_MAP.set(item[0], exposeFilepath)
    item[1].id = exposeFilepath
    moduleMap += `\n"${item[0]}":()=>{
      ${DYNAMIC_LOADING_CSS}('${DYNAMIC_LOADING_CSS_PREFIX}${exposeFilepath}')
      return __federation_import('\${__federation_expose_${item[0]}}').then(module=>()=>module?.default??module)
    },`
  }

  let remoteEntryChunk

  return {
    name: 'originjs:expose-production',
    virtualFile: {
      // code generated for remote
      __remoteEntryHelper__: `let moduleMap = {${moduleMap}}
    export const ${DYNAMIC_LOADING_CSS} = (cssFilePath) => {
      const metaUrl = import.meta.url
      if (typeof metaUrl == 'undefined') {
        console.warn('The remote style takes effect only when the build.target option in the vite.config.ts file is higher than that of "es2020".')
        return
      }
      const curUrl = metaUrl.substring(0, metaUrl.lastIndexOf('${options.filename}'))
      const element = document.head.appendChild(document.createElement('link'))
      element.href = curUrl + cssFilePath
      element.rel = 'stylesheet'
    };
    async function __federation_import(name) {
        return import(name);
    };
    export const get =(module) => {
        return moduleMap[module]();
    };
    export const init =(shareScope) => {
      globalThis.__federation_shared__= globalThis.__federation_shared__|| {};
      Object.entries(shareScope).forEach(([key, value]) => {
        const versionKey = Object.keys(value)[0];
        const versionValue = Object.values(value)[0];
        const scope = versionValue.scope || 'default'
        globalThis.__federation_shared__[scope] = globalThis.__federation_shared__[scope] || {};
        const shared= globalThis.__federation_shared__[scope];
        (shared[key] = shared[key]||{})[versionKey] = versionValue;
      });
    }`
    },

    options() {
      // Split expose & shared module to separate chunks
      // _options.preserveEntrySignatures = 'strict'
      return null
    },

    buildStart() {
      // if we don't expose any modules, there is no need to emit file
      if (parsedOptions.prodExpose.length > 0) {
        this.emitFile({
          fileName: `${
            builderInfo.assetsDir ? builderInfo.assetsDir + '/' : ''
          }${options.filename}`,
          type: 'chunk',
          id: '__remoteEntryHelper__',
          preserveSignature: 'strict'
        })
      }
    },
    renderChunk(code, chunk) {
      if (chunk.facadeModuleId === '\0virtual:__remoteEntryHelper__') {
        remoteEntryChunk = chunk
      }
      return null
    },
    generateBundle(_options, bundle) {
      const moduleCssFileMap = getChunkCssRelation(bundle)

      // replace import absolute path to chunk's fileName in remoteEntry.js
      for (const file in bundle) {
        const chunk = bundle[file]
        if (chunk.type === 'chunk' && chunk.isEntry) {
          if (!remoteEntryChunk && chunk.fileName === options.filename) {
            remoteEntryChunk = chunk
          }
        }
      }
      // placeholder replace
      if (remoteEntryChunk) {
        const item = remoteEntryChunk
        // replace __f__dynamic_loading_css__ to dynamicLoadingCss
        moduleCssFileMap.forEach((value, key) => {
          item.code = item.code.replace(
            `${DYNAMIC_LOADING_CSS_PREFIX}${key}`,
            `./${basename(value)}`
          )
        })

        // remove all __f__dynamic_loading_css__ after replace
        let ast: AcornNode | null = null
        try {
          ast = this.parse(item.code)
        } catch (err) {
          console.error(err)
        }
        if (!ast) {
          return
        }
        const magicString = new MagicString(item.code)
        // let cssFunctionName: string = DYNAMIC_LOADING_CSS
        walk(ast, {
          enter(node: any) {
            if (
              node.type === 'CallExpression' &&
              typeof node?.arguments[0]?.value === 'string' &&
              node?.arguments[0]?.value.indexOf(
                `${DYNAMIC_LOADING_CSS_PREFIX}`
              ) > -1
            ) {
              magicString.remove(node.start, node.end + 1)
            }
          }
        })
        item.code = magicString.toString()
      }
    }
  }

  /**
   *
   * Gets the relationship between CSS and JS based on the original file name
   * @param bundle bundle
   * @returns relationship between CSS and JS
   */
  function getChunkCssRelation(bundle) {
    const cssFileMap = new Map()
    const moduleCssFileMap = new Map()

    for (const file in bundle) {
      if (extname(file) === '.css') {
        cssFileMap.set(getOriginalFileName(file), file)
      }
    }

    for (const file in bundle) {
      let name = getOriginalFileName(file)
      if (cssFileMap.get(name) != null && extname(file) !== '.css') {
        moduleCssFileMap.set(bundle[file].facadeModuleId, cssFileMap.get(name))
        continue
      }

      // Replace the null reference file with the original file
      const chunk = bundle[file]
      if (
        chunk?.modules != undefined &&
        Object.keys(chunk?.modules)?.length === 0
      ) {
        name = getOriginalFileName(chunk.imports[0])
        if (cssFileMap.get(name) != null) {
          moduleCssFileMap.set(chunk.facadeModuleId, cssFileMap.get(name))
        }
      }
    }

    // when build.cssCodeSplit: false, all files are aggregated into style.xxxxxxxx.css
    if (moduleCssFileMap.size === 0) {
      for (const file in bundle) {
        cssFileMap.forEach(function (css) {
          moduleCssFileMap.set(bundle[file].facadeModuleId, css)
        })
      }
    }
    return moduleCssFileMap

    function getOriginalFileName(file: string): string {
      return parse(parse(file).name).name
    }
  }
}
