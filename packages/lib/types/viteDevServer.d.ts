import { ViteDevServer as Config } from 'vite'

export interface ViteDevServer extends Config {
  _optimizeDepsMetadata?: {
    hash: string
    browserHash: string
    optimized: Map<string, Optimized>
  }
}

declare interface Optimized {
  file: string
  src: string
  needsInterop: boolean
}
