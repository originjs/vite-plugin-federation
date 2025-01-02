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

import { resolve } from 'path'
import { getModuleMarker, normalizePath, parseExposeOptions } from '../utils'
import { EXTERNALS, SHARED, builderInfo, parsedOptions } from '../public'
import type { VitePluginFederationOptions } from 'types'
import type { PluginHooks } from '../../types/pluginHooks'
import { UserConfig, ViteDevServer } from 'vite'
import { importShared } from './import-shared'

export function devExposePlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.devExpose = parseExposeOptions(options)
  let moduleMap = ''
  let remoteFile: string | null = null

  const exposeModules = (baseDir) => {
    for (const item of parsedOptions.devExpose) {
      const moduleName = getModuleMarker(`\${${item[0]}}`, SHARED)
      EXTERNALS.push(moduleName)
      const importPath = normalizePath(item[1].import)
      const exposeFilepath = normalizePath(resolve(item[1].import))
      moduleMap += `\n"${item[0]}":() => {
        return __federation_import('/${importPath}', '${baseDir}@fs/${exposeFilepath}').then(module =>Object.keys(module).every(item => exportSet.has(item)) ? () => module.default : () => module)},`
    }
  }

  const buildRemoteFile = (baseDir) => {
    return `(${importShared})(); 
    import RefreshRuntime from "${baseDir}@react-refresh"
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
      const exportSet = new Set(['Module', '__esModule', 'default', '_export_sfc']);
      let moduleMap = {
        ${moduleMap}
      };
      const __federation_import = async (urlImportPath, fsImportPath) => {
        let importedModule;
        try {
          return await import(fsImportPath);
        }catch(ex) {
          return await import(urlImportPath);
        }
      };
      export const get =(module) => {
        if(!moduleMap[module]) throw new Error('Can not find remote module ' + module)
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
      }
    `
  }

  return {
    name: 'originjs:expose-development',
    config: (config: UserConfig) => {
      if (config.base) {
        exposeModules(config.base)
        remoteFile = buildRemoteFile(config.base)
      }
    },
    configureServer: (server: ViteDevServer) => {
      const remoteFilePath = `${builderInfo.assetsDir}/${options.filename}`
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.includes(remoteFilePath)) {
          res.writeHead(200, 'OK', {
            'Content-Type': 'text/javascript',
            'Access-Control-Allow-Origin': '*'
          })
          res.write(remoteFile)
          res.end()
        } else {
          next()
        }
      })
    }
  }
}
