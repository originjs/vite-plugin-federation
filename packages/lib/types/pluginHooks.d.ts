import { Plugin as VitePlugin } from 'vite'
export interface PluginHooks extends VitePlugin {
  virtualFile?: Record<string, unknown>
}
export type PluginHookConfig =
  | ((
      this: void,
      config: UserConfig,
      env: ConfigEnv
    ) => UserConfig | null | void | Promise<UserConfig | null | void>)
  | undefined

export type PluginHookConfigureServer =
  | ((
      this: void,
      server: ViteDevServer
    ) => (() => void) | void | Promise<(() => void) | void>)
  | undefined

export type PluginHookConfigResolved =
  | ((this: void, config: ResolvedConfig) => void | Promise<void>)
  | undefined

export type PluginHookBuildStart =
  | ((this: PluginContext, options: NormalizedInputOptions) => void)
  | undefined

export type PluginHookTransform =
  | ((
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

export type PluginHookModuleParsed = (
  this: PluginContext,
  info: ModuleInfo
) => void | undefined

export type PluginHookOutputOptions =
  | ((this: PluginContext, options: OutputOptions) => OutputOptions | NullValue)
  | undefined

export type PluginHookRenderChunk =
  | ((
      this: MinimalPluginContext,
      code: string,
      chunk: RenderedChunk,
      options: NormalizedOutputOptions,
      meta: { chunks: Record<string, RenderedChunk> }
    ) => { code: string; map?: SourceMapInput } | string | NullValue)
  | undefined

export type PluginHookGenerateBundle =
  | ((
      this: PluginContext,
      options: NormalizedOutputOptions,
      bundle: OutputBundle,
      isWrite: boolean
    ) => void)
  | undefined
