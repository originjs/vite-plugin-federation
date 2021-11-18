import { parseExposeOptions } from '../utils'
import { parsedOptions } from '../public'
import { VitePluginFederationOptions } from 'types'
import { PluginHooks } from '../../types/pluginHooks'

export function devExposePlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.devExpose = parseExposeOptions(options)

  return {
    name: 'originjs:expose-development'
  }
}
