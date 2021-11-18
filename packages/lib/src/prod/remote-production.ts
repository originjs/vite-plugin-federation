import {
  ConfigTypeSet,
  RemotesConfig,
  VitePluginFederationOptions
} from 'types'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import { AcornNode, TransformPluginContext } from 'rollup'
import { getModuleMarker, parseRemoteOptions, removeNonLetter } from '../utils'
import { builderInfo, parsedOptions } from '../public'
import * as path from 'path'
import { PluginHooks } from '../../types/pluginHooks'

export function prodRemotePlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.prodRemote = parseRemoteOptions(options)
  const remotes: { id: string; regexp: RegExp; config: RemotesConfig }[] = []
  for (const item of parsedOptions.prodRemote) {
    remotes.push({
      id: item[0],
      regexp: new RegExp(`^${item[0]}/.+?`),
      config: item[1]
    })
  }

  return {
    name: 'originjs:remote-production',
    virtualFile: {
      __federation__: `
const remotesMap = {
  ${remotes
    .map(
      (remote) =>
        `${JSON.stringify(remote.id)}: () => ${
          options.mode === 'development' ? 'import' : '__federation_import'
        }(${JSON.stringify(remote.config.external[0])})`
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
  ${getModuleMarker('shareScope')}
};

async function __federation_import(name){
  return import(name);
}

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

    async transform(this: TransformPluginContext, code: string, id: string) {
      if (builderInfo.isShared) {
        for (const sharedInfo of parsedOptions.prodShared) {
          if (!sharedInfo[1].emitFile) {
            sharedInfo[1].emitFile = this.emitFile({
              type: 'chunk',
              id: sharedInfo[0],
              fileName: `${
                builderInfo.assetsDir ? builderInfo.assetsDir + '/' : ''
              }__federation_shared_${sharedInfo[0]}.js`,
              name: sharedInfo[0],
              preserveSignature: 'allow-extension'
            })
          }
        }

        if (id === '\0virtual:__federation_fn_import') {
          const moduleMapCode = parsedOptions.prodShared
            .map(
              (sharedInfo) =>
                `'${
                  sharedInfo[0]
                }':{get:()=>__federation_import('./${path.basename(
                  this.getFileName(sharedInfo[1].emitFile)
                )}'),import:${sharedInfo[1].import}${
                  sharedInfo[1].requiredVersion
                    ? `,requiredVersion:'${sharedInfo[1].requiredVersion}'`
                    : ''
                }}`
            )
            .join(',')
          return code.replace(
            getModuleMarker('moduleMap', 'var'),
            `{${moduleMapCode}}`
          )
        }
      }

      if (builderInfo.isRemote) {
        for (const expose of parsedOptions.prodExpose) {
          if (!expose[1].emitFile) {
            expose[1].emitFile = this.emitFile({
              type: 'chunk',
              id: expose[1].id,
              fileName: `${
                builderInfo.assetsDir ? builderInfo.assetsDir + '/' : ''
              }__federation_expose_${removeNonLetter(expose[0])}.js`,
              name: `__federation_expose_${removeNonLetter(expose[0])}`,
              preserveSignature: 'allow-extension'
            })
          }
        }
        if (id === '\0virtual:__remoteEntryHelper__') {
          for (const expose of parsedOptions.prodExpose) {
            code = code.replace(
              `\${__federation_expose_${expose[0]}}`,
              `./${path.basename(this.getFileName(expose[1].emitFile))}`
            )
          }
          return code
        }
      }

      if (builderInfo.isHost) {
        if (id === '\0virtual:__federation__') {
          return code.replace(
            getModuleMarker('shareScope'),
            sharedScopeCode.call(this, parsedOptions.prodShared).join(',')
          )
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
                const remote = remotes.find((r) => r.regexp.test(moduleId))
                if (remote) {
                  requiresRuntime = true
                  const modName = `.${moduleId.slice(remote.id.length)}`
                  magicString.overwrite(
                    node.start,
                    node.end,
                    `__federation__.ensure(${JSON.stringify(
                      remote.id
                    )}).then((remote) => remote.get(${JSON.stringify(
                      modName
                    )}))`
                  )
                }
              }
            }
          }
        })

        if (requiresRuntime) {
          magicString.prepend(
            `import __federation__ from '__federation__';\n\n`
          )
        }

        return {
          code: magicString.toString(),
          map: null
        }
      }
    }
  }

  function sharedScopeCode(
    this: TransformPluginContext,
    shared: (string | ConfigTypeSet)[]
  ): string[] {
    const res: string[] = []
    const displayField = new Set<string>()
    displayField.add('version')
    displayField.add('shareScope')
    if (shared.length) {
      shared.forEach((arr) => {
        const sharedName = arr[0]
        const obj = arr[1]
        let str = ''
        if (typeof obj === 'object') {
          Object.entries(obj).forEach(([key, value]) => {
            if (displayField.has(key))
              str += `${key}:${JSON.stringify(value)}, \n`
          })
          str += `get: ()=> __federation_import('./${path.basename(
            this.getFileName(obj.emitFile)
          )}')`
          res.push(`'${sharedName}':{${str}}`)
        }
      })
    }
    return res
  }
}
