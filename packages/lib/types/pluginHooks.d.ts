import {
  InputOptions,
  InternalModuleFormat,
  LoadHook,
  MinimalPluginContext,
  ModuleParsedHook,
  NormalizedInputOptions,
  NormalizedOutputOptions,
  OutputBundle,
  OutputOptions,
  PluginContext,
  PreRenderedChunk,
  RenderChunkHook,
  ResolveAssetUrlHook,
  ResolveDynamicImportHook,
  ResolveFileUrlHook,
  ResolveIdHook,
  ResolveImportMetaHook,
  TransformHook,
  WatchChangeHook
} from 'rollup'
import { VitePluginFederationOptions } from './index'

interface OutputPluginHooks {
  augmentChunkHash?: (
    this: PluginContext,
    chunk: PreRenderedChunk
  ) => string | void
  generateBundle?: (
    this: PluginContext,
    options: NormalizedOutputOptions,
    bundle: OutputBundle,
    isWrite?: boolean
  ) => void | Promise<void>
  outputOptions?: (
    this: PluginContext,
    options: OutputOptions
  ) => OutputOptions | null | undefined
  renderChunk?: RenderChunkHook
  renderDynamicImport?: (
    this: PluginContext,
    options: {
      customResolution: string | null
      format: InternalModuleFormat
      moduleId: string
      targetModuleId: string | null
    }
  ) => { left: string; right: string } | null | undefined
  renderError?: (this: PluginContext, err?: Error) => Promise<void> | void
  renderStart?: (
    this: PluginContext,
    outputOptions: NormalizedOutputOptions,
    inputOptions: NormalizedInputOptions
  ) => Promise<void> | void
  /** @deprecated Use `resolveFileUrl` instead */
  resolveAssetUrl?: ResolveAssetUrlHook
  resolveFileUrl?: ResolveFileUrlHook
  resolveImportMeta?: ResolveImportMetaHook
  writeBundle?: (
    this: PluginContext,
    options: NormalizedOutputOptions,
    bundle: OutputBundle
  ) => void | Promise<void>
}

export interface PluginHooks extends OutputPluginHooks {
  init?: (config: VitePluginFederationOptions) => void
  buildEnd?: (this: PluginContext, err?: Error) => Promise<void> | void
  buildStart?: (
    this: PluginContext,
    options: NormalizedInputOptions
  ) => Promise<void> | void
  closeBundle?: (this: PluginContext) => Promise<void> | void
  closeWatcher?: (this: PluginContext) => void
  load?: LoadHook
  moduleParsed?: ModuleParsedHook
  options?: (
    options: InputOptions
  ) =>
    | Promise<InputOptions | null | undefined>
    | InputOptions
    | null
    | undefined
  resolveDynamicImport?: ResolveDynamicImportHook
  resolveId?: ResolveIdHook
  transform?: TransformHook
  watchChange?: WatchChangeHook
}
