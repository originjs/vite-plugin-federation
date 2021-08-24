import { Plugin } from 'vite'
import virtual from '@rollup/plugin-virtual'
import { exposesPlugin } from './exposes'
import { remotesPlugin } from './remotes'
import { sharedPlugin } from './shared'
import { VitePluginFederationOptions } from '../types'

export default function federation(
  options: VitePluginFederationOptions
): Plugin {
  const pluginList = [
    exposesPlugin(options),
    remotesPlugin(options),
    sharedPlugin(options)
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
    options(_options) {
      for (const pluginHook of pluginList) {
        pluginHook.options?.call(this, _options)
      }
      return _options
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
    },

    transform(code: string, id: string) {
      for (const pluginHook of pluginList) {
        if (pluginHook.transform)
          return pluginHook.transform.call(this, code, id)
      }
    }
  }
}
