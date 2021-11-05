import { ConfigEnv, Plugin, UserConfig, ViteDevServer } from 'vite'
import virtual from '@rollup/plugin-virtual'
import { remotesPlugin } from './remotes'
import { VitePluginFederationOptions } from '../types'
import {
  builderInfo,
  DEFAULT_ENTRY_FILENAME,
  IMPORT_ALIAS_REGEXP
} from './public'
import { PluginHooks } from '../types/pluginHooks'
import { ModuleInfo } from 'rollup'
import { sharedPlugin } from './shared'
import { exposesPlugin } from './exposes'

export default function federation(
  options: VitePluginFederationOptions
): Plugin {
  options.filename = options.filename
    ? options.filename
    : DEFAULT_ENTRY_FILENAME

  let pluginList: PluginHooks[]
  let virtualMod

  function registerPlugins(mode: string) {
    // Prevent duplicate registration of plugins
    if (options.mode === 'development' || options.mode === 'production') {
      return
    }

    options.mode = mode ? mode : options.mode
    if (options.mode === 'development') {
      pluginList = [remotesPlugin(options)]
    } else if (options.mode === 'production' || options.mode === 'rollup') {
      pluginList = [
        sharedPlugin(options),
        exposesPlugin(options),
        remotesPlugin(options)
      ]
    } else {
      pluginList = []
    }

    let virtualFiles = {}
    pluginList.forEach((plugin) => {
      if (plugin.virtualFile) {
        virtualFiles = Object.assign(virtualFiles, plugin.virtualFile)
      }
    })
    virtualMod = virtual(virtualFiles)
  }

  return {
    name: 'originjs:federation',
    // for scenario vite.config.js build.cssCodeSplit: false
    // vite:css-post plugin will summarize all the styles in the style.xxxxxx.css file
    // so, this plugin need run after vite:css-post in post plugin list
    enforce: 'post',
    // apply:'build',
    options(_options) {
      // Register default plugins
      registerPlugins('rollup')

      // _options.preserveEntrySignatures = 'strict'
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
    config(config: UserConfig, env: ConfigEnv) {
      registerPlugins(env.mode)
      for (const pluginHook of pluginList) {
        pluginHook.config?.call(this, config, env)
      }

      // only run when builder is vite,rollup doesnt have hook named `config`
      builderInfo.builder = 'vite'
      builderInfo.assetsDir = config?.build?.assetsDir ?? 'assets'
    },
    configureServer(server: ViteDevServer) {
      for (const pluginHook of pluginList) {
        pluginHook.configureServer?.call(this, server)
      }
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

    transform(code: string, id: string) {
      for (const pluginHook of pluginList) {
        const result = pluginHook.transform?.call(this, code, id)
        if (result) {
          return result
        }
      }
      return code
    },
    moduleParsed(moduleInfo: ModuleInfo): void {
      for (const pluginHook of pluginList) {
        pluginHook.moduleParsed?.call(this, moduleInfo)
      }
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
    }
  }
}
