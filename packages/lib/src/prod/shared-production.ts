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

import type { PluginHooks } from '../../types/pluginHooks'
import { NAME_CHAR_REG, parseSharedOptions, removeNonRegLetter } from '../utils'
import { builderInfo, parsedOptions } from '../public'
import type { ConfigTypeSet, VitePluginFederationOptions } from 'types'
import { basename, join, resolve } from 'path'
import { readdirSync, readFileSync, statSync } from 'fs'
const sharedFilePathReg = /__federation_shared_(.+)\.js$/
import federation_fn_import from './federation_fn_import.js?raw'

export function prodSharedPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.prodShared = parseSharedOptions(options)
  const shareName2Prop = new Map<string, any>()
  parsedOptions.prodShared.forEach((value) =>
    shareName2Prop.set(removeNonRegLetter(value[0], NAME_CHAR_REG), value[1])
  )
  let isHost
  let isRemote
  const id2Prop = new Map<string, any>()

  return {
    name: 'originjs:shared-production',
    virtualFile: {
      __federation_fn_import: federation_fn_import
    },
    options(inputOptions) {
      isRemote = !!parsedOptions.prodExpose.length
      isHost =
        !!parsedOptions.prodRemote.length && !parsedOptions.prodExpose.length

      if (shareName2Prop.size) {
        // remove item which is both in external and shared
        inputOptions.external = (inputOptions.external as [])?.filter(
          (item) => {
            return !shareName2Prop.has(removeNonRegLetter(item, NAME_CHAR_REG))
          }
        )
      }
      return inputOptions
    },

    async buildStart() {
      // Cannot emit chunks after module loading has finished, so emitFile first.
      if (parsedOptions.prodShared.length && isRemote) {
        this.emitFile({
          fileName: `${
            builderInfo.assetsDir ? builderInfo.assetsDir + '/' : ''
          }__federation_fn_import.js`,
          type: 'chunk',
          id: '__federation_fn_import',
          preserveSignature: 'strict'
        })
      }

      // forEach and collect dir
      const collectDirFn = (filePath: string, collect: string[]) => {
        const files = readdirSync(filePath)
        files.forEach((name) => {
          const tempPath = join(filePath, name)
          const isDir = statSync(tempPath).isDirectory()
          if (isDir) {
            collect.push(tempPath)
            collectDirFn(tempPath, collect)
          }
        })
      }

      const monoRepos: { arr: string[]; root: string | ConfigTypeSet }[] = []
      const dirPaths: string[] = []
      const currentDir = resolve()
      //  try to get every module package.json file
      for (const arr of parsedOptions.prodShared) {
        if (isHost && !arr[1].version && !arr[1].manuallyPackagePathSetting) {
          const packageJsonPath = (
            await this.resolve(`${arr[1].packagePath}/package.json`)
          )?.id
          if (packageJsonPath) {
            const packageJson = JSON.parse(
              readFileSync(packageJsonPath, { encoding: 'utf-8' })
            )
            arr[1].version = packageJson.version
          } else {
            arr[1].removed = true
            const dir = join(currentDir, 'node_modules', arr[0])
            const dirStat = statSync(dir)
            if (dirStat.isDirectory()) {
              collectDirFn(dir, dirPaths)
            } else {
              this.error(`cant resolve "${arr[1].packagePath}"`)
            }

            if (dirPaths.length > 0) {
              monoRepos.push({ arr: dirPaths, root: arr })
            }
          }

          if (!arr[1].removed && !arr[1].version) {
            this.error(
              `No description file or no version in description file (usually package.json) of ${arr[0]}. Add version to description file, or manually specify version in shared config.`
            )
          }
        }
      }
      parsedOptions.prodShared = parsedOptions.prodShared.filter(
        (item) => !item[1].removed
      )
      // assign version to monoRepo
      if (monoRepos.length > 0) {
        for (const monoRepo of monoRepos) {
          for (const id of monoRepo.arr) {
            try {
              const idResolve = await this.resolve(id)
              if (idResolve?.id) {
                (parsedOptions.prodShared as any[]).push([
                  `${monoRepo.root[0]}/${basename(id)}`,
                  {
                    id: idResolve?.id,
                    import: monoRepo.root[1].import,
                    shareScope: monoRepo.root[1].shareScope,
                    root: monoRepo.root
                  }
                ])
              }
            } catch (e) {
              //    ignore
            }
          }
        }
      }

      if (parsedOptions.prodShared.length && isRemote) {
        for (const prod of parsedOptions.prodShared) {
          id2Prop.set(prod[1].id, prod[1])
        }
      }
    },

    outputOptions: function (outputOption) {
      // remove rollup generated empty imports,like import './filename.js'
      outputOption.hoistTransitiveImports = false

      const manualChunkFunc = (id: string) => {
        //  if id is in shared dependencies, return id ,else return vite function value
        const find = parsedOptions.prodShared.find((arr) =>
          arr[1].dependencies?.has(id)
        )
        return find ? find[0] : undefined
      }

      // only active when manualChunks is function,array not to solve
      if (typeof outputOption.manualChunks === 'function') {
        outputOption.manualChunks = new Proxy(outputOption.manualChunks, {
          apply(target, thisArg, argArray) {
            const result = manualChunkFunc(argArray[0])
            return result ? result : target(argArray[0], argArray[1])
          }
        })
      }

      // The default manualChunk function is no longer available from vite 2.9.0
      if (outputOption.manualChunks === undefined) {
        outputOption.manualChunks = manualChunkFunc
      }

      return outputOption
    },

    generateBundle(options, bundle) {
      if (!isRemote) {
        return
      }
      const needRemoveShared = new Set<string>()
      for (const key in bundle) {
        const chunk = bundle[key]
        if (chunk.type === 'chunk') {
          if (!isHost) {
            const regRst = sharedFilePathReg.exec(chunk.fileName)
            if (regRst && shareName2Prop.get(regRst[1])?.generate === false) {
              needRemoveShared.add(key)
            }
          }
        }
      }
      if (needRemoveShared.size !== 0) {
        for (const key of needRemoveShared) {
          delete bundle[key]
        }
      }
    }
  }
}
