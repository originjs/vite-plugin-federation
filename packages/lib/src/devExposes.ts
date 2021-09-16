import { VitePluginFederationOptions } from '../types'
import { PluginHooks } from '../types/pluginHooks'
import { parseOptions } from './utils'

export let devProvideExposes

export function devExposesPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  console.log(`The current operating mode is ${options.mode}`)

  devProvideExposes = parseOptions(
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

  return {
    name: 'originjs:dev',
    options(_options) {
      return _options
    }
  }
}
