import type { PluginHooks } from '../../types/pluginHooks'
import { parseSharedOptions } from '../utils'
import { parsedOptions } from '../public'
import type { VitePluginFederationOptions } from 'types'

export function devSharedPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.devShared = parseSharedOptions(options)

  return {
    name: 'originjs:shared-development'
  }
}
