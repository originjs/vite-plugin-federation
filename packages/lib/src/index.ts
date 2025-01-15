// *****************************************************************************
// Copyright (C) 2022 Origin.js and others.
//
// This program and the accompanying materials are licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//          http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
// EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
// MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
//
// SPDX-License-Identifier: MulanPSL-2.0
// *****************************************************************************

import type {
  ConfigEnv,
  Plugin,
  UserConfig,
  ViteDevServer,
  ResolvedConfig
} from 'vite'
import virtual from '@rollup/plugin-virtual'
import { dirname } from 'path'
import { prodRemotePlugin } from './prod/remote-production'
import type { VitePluginFederationOptions } from '../types'
import { builderInfo, DEFAULT_ENTRY_FILENAME, parsedOptions } from './public'
import type { PluginHooks } from '../types/pluginHooks'
import {
  InputOptions,
  NormalizedInputOptions,
  NormalizedOutputOptions,
  NullValue,
  OutputBundle,
  OutputOptions,
  PluginContext,
  RenderedChunk,
  SourceDescription,
  SourceMapInput,
  TransformPluginContext,
  type MinimalPluginContext,
  type ModuleInfo
} from 'rollup'
import { prodSharedPlugin } from './prod/shared-production'
import { prodExposePlugin } from './prod/expose-production'
import { devSharedPlugin } from './dev/shared-development'
import { devRemotePlugin } from './dev/remote-development'
import { devExposePlugin } from './dev/expose-development'

export default function federation(
  options: VitePluginFederationOptions
): Plugin {
  options.filename = options.filename
    ? options.filename
    : DEFAULT_ENTRY_FILENAME

  let pluginList: PluginHooks[] = []
  let virtualMod
  let registerCount = 0

  function registerPlugins(mode: string, command: string) {
    if (mode === 'production' || command === 'build') {
      pluginList = [
        prodSharedPlugin(options),
        prodExposePlugin(options),
        prodRemotePlugin(options)
      ]
    } else if (mode === 'development' || command === 'serve') {
      pluginList = [
        devSharedPlugin(options),
        devExposePlugin(options),
        devRemotePlugin(options)
      ]
    } else {
      pluginList = []
    }
    builderInfo.isHost = !!(
      parsedOptions.prodRemote.length || parsedOptions.devRemote.length
    )
    builderInfo.isRemote = !!(
      parsedOptions.prodExpose.length || parsedOptions.devExpose.length
    )
    builderInfo.isShared = !!(
      parsedOptions.prodShared.length || parsedOptions.devShared.length
    )

    let virtualFiles = {}
    pluginList.forEach((plugin) => {
      if (plugin.virtualFile) {
        virtualFiles = Object.assign(virtualFiles, plugin.virtualFile)
      }
    })
    virtualMod = virtual(virtualFiles)
  }

  const plugin: Plugin = {
    name: 'originjs:federation',
    // for scenario vite.config.js build.cssCodeSplit: false
    // vite:css-post plugin will summarize all the styles in the style.xxxxxx.css file
    // so, this plugin need run after vite:css-post in post plugin list
    enforce: 'post',
    // apply:'build',
    options(_options) {
      // rollup doesnt has options.mode and options.command
      if (!registerCount++) {
        registerPlugins((options.mode = options.mode ?? 'production'), '')
      }

      if (typeof _options.input === 'string') {
        _options.input = { index: _options.input }
      }
      _options.external = _options.external || []
      if (!Array.isArray(_options.external)) {
        _options.external = [_options.external as string]
      }
      for (const pluginHook of pluginList) {(
            pluginHook.options as ((
              this: MinimalPluginContext,
              options: InputOptions
            ) => InputOptions | NullValue) | undefined
          )?.call(this, _options)
      }
      return _options
    },
    config(config: UserConfig, env: ConfigEnv) {
      options.mode = options.mode ?? env.mode
      registerPlugins(options.mode, env.command)
      registerCount++
      for (const pluginHook of pluginList) {(
            pluginHook.config as ((
              this: void,
              config: UserConfig,
              env: ConfigEnv
            ) => UserConfig | null | void | Promise<UserConfig | null | void>) | undefined
          )?.call(this, config, env)
        
      }

      // only run when builder is vite,rollup doesnt has hook named `config`
      builderInfo.builder = 'vite'
      builderInfo.assetsDir = config?.build?.assetsDir ?? 'assets'
    },
    configureServer(server: ViteDevServer) {
      for (const pluginHook of pluginList) {
          (
            pluginHook.configureServer as ((
              this: void,
              server: ViteDevServer
            ) => (() => void) | void | Promise<(() => void) | void>)|undefined
          )?.call(this, server)
      }
    },
    configResolved(config: ResolvedConfig) {
      for (const pluginHook of pluginList) {
        (
          pluginHook.configResolved as ((
            this: void,
            config: ResolvedConfig
          ) => void | Promise<void>)| undefined
        )?.call(this, config)
      }
    },
    buildStart(inputOptions) {
      for (const pluginHook of pluginList) {
          (
            pluginHook.buildStart as ((
              this: PluginContext,
              options: NormalizedInputOptions
            ) => void )| undefined
          )?.call(this, inputOptions)
      }
    },

    async resolveId(...args) {
      const v = virtualMod.resolveId.call(this, ...args)
      if (v) {
        return v
      }
      if (args[0] === '\0virtual:__federation_fn_import') {
        return {
          id: '\0virtual:__federation_fn_import',
          moduleSideEffects: true
        }
      }
      if (args[0] === '__federation_fn_satisfy') {
        const federationId = (
          await this.resolve('@originjs/vite-plugin-federation')
        )?.id
        return await this.resolve(`${dirname(federationId!)}/satisfy.mjs`)
      }
      if (args[0] === 'virtual:__federation__') {
        return {
          id: '\0virtual:__federation__',
          moduleSideEffects: true
        }
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
        const result = (
          pluginHook.transform as ((
            this: TransformPluginContext,
            code: string,
            id: string,
            options?: {
              ssr?: boolean
            }
          ) =>
            | Promise<string | NullValue | Partial<SourceDescription>>
            | (string | NullValue | Partial<SourceDescription>))
            | undefined
        )?.call(this, code, id)
        if (result) {
          return result
        }
      }
      return code
    },
    moduleParsed(moduleInfo: ModuleInfo): void {
      for (const pluginHook of pluginList) {
        (
          pluginHook.moduleParsed as (
            this: PluginContext,
            info: ModuleInfo
          ) => void | undefined
        )?.call(this, moduleInfo)
      }
    },

    outputOptions(outputOptions) {
      for (const pluginHook of pluginList) {
        (
          pluginHook.outputOptions as
            | ((
                this: PluginContext,
                options: OutputOptions
              ) => OutputOptions | NullValue)
            | undefined
        )?.call(this, outputOptions)
      }
      return outputOptions
    },

    renderChunk(code, chunkInfo, _options) {
      for (const pluginHook of pluginList) {
        if (pluginHook.renderChunk) {
          const result = (
            pluginHook.renderChunk as
              | ((
                  this: MinimalPluginContext,
                  code: string,
                  chunk: RenderedChunk,
                  options: NormalizedOutputOptions,
                  meta: { chunks: Record<string, RenderedChunk> }
                ) =>
                  | { code: string; map?: SourceMapInput }
                  | string
                  | NullValue)
              | undefined
          )?.call(this, code, chunkInfo, _options, { chunks: {} })
          if (result) {
            return result
          }
        }
      }
      return null
    },

    generateBundle: function (_options, bundle, isWrite) {
      for (const pluginHook of pluginList) {
          (
            pluginHook.generateBundle as ((
              this: PluginContext,
              options: NormalizedOutputOptions,
              bundle: OutputBundle,
              isWrite: boolean
            ) => void) | undefined
          )?.call(this, _options, bundle, isWrite)
      }
    }
  }
  return plugin
}
