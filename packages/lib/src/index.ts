import { Plugin } from 'vite'
import virtual from '@rollup/plugin-virtual'
import { exposesPlugin } from './exposes'
import { remotesPlugin } from './remotes'
import { sharedPlugin } from './shared'
import { VitePluginFederationOptions } from '../types'
import {
  IMPORT_ALIAS_REGEXP,
  DEFAULT_ENTRY_FILENAME,
  builderInfo
} from './public'
import { PluginHooks } from '../types/pluginHooks'

export default function federation(
  options: VitePluginFederationOptions
): Plugin {
  options.filename = options.filename
    ? options.filename
    : DEFAULT_ENTRY_FILENAME

  const pluginList: PluginHooks[] = [
    exposesPlugin(options),
    sharedPlugin(options),
    remotesPlugin(options)
  ]
  let virtualFiles = {}
  pluginList.forEach((plugin) => {
    if (plugin.virtualFile) {
      virtualFiles = Object.assign(virtualFiles, plugin.virtualFile)
    }
  })
  const virtualMod = virtual(virtualFiles)

  return {
    name: 'originjs:federation',
    // for scenario vite.config.js build.cssCodeSplit: false
    // vite:css-post plugin will summarize all the styles in the style.xxxxxx.css file
    // so, this plugin need run after vite:css-post in post plugin list
    enforce: 'post',
    apply: 'build',
    options(_options) {
      _options.preserveEntrySignatures = 'strict'
      if (typeof _options.input === 'string') {
        _options.input = { index: _options.input }
      }
      _options.external = _options.external || []
      if (!Array.isArray(_options.external)) {
        _options.external = [_options.external as string]
      }
      for (const pluginHook of pluginList) {
        pluginHook.options?.call(this, _options)
      }
      return _options
    },
    config() {
      // only run when builder is vite,rollup doesnt have hook named `config`
      builderInfo.builder = 'vite'
    },

    buildStart(inputOptions) {
      for (const pluginHook of pluginList) {
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
      outputOptions.manualChunks = outputOptions.manualChunks || {}
      for (const pluginHook of pluginList) {
        pluginHook.outputOptions?.call(this, outputOptions)
      }
      return outputOptions
    },

    renderChunk(code, chunkInfo, _options) {
      for (const pluginHook of pluginList) {
        pluginHook.renderChunk?.call(this, code, chunkInfo, _options)
      }
      return null
    },

    generateBundle: function (_options, bundle, isWrite) {
      for (const pluginHook of pluginList) {
        pluginHook.generateBundle?.call(this, _options, bundle, isWrite)
      }

      //  replace import_alias => import to ignore vite preload
      for (const fileKey in bundle) {
        const chunk = bundle[fileKey]
        if (chunk.type === 'chunk') {
          chunk.code = chunk.code.replace(IMPORT_ALIAS_REGEXP, 'import')
        }
      }
    },

    transform(code: string, id: string) {
      for (const pluginHook of pluginList) {
        if (pluginHook.transform)
          return pluginHook.transform.call(this, code, id)
      }
    }
  }
}
