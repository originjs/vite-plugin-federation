import { Plugin as VitePlugin } from 'vite'
export interface PluginHooks extends VitePlugin {
  virtualFile?: Record<string, unknown>
}
