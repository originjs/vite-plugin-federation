/**
 * The following code is adapted from https://github.com/webpack/webpack/types.d.ts
 * MIT License https://github.com/webpack/webpack/LICENSE
 */
import { RenderedChunk } from 'rollup'

export default function federation(options: VitePluginFederationOptions): Plugin

declare interface VitePluginFederationOptions {
  /**
   * Modules that should be exposed by this container. When provided, property name is used as public name, otherwise public name is automatically inferred from request.
   */
  exposes?: Exposes

  /**
   * The filename of the container as relative path inside the `output.path` directory.
   */
  filename?: string

  /**
   * transform hook need to handle file types
   * default ['.js','.ts','.jsx','.tsx','.mjs','.cjs','.vue','.svelte']
   */
  transformFileTypes?: string[]

  /**
   * Options for library.
   */
  // library?: LibraryOptions

  /**
   * The name of the container.
   */
  name?: string

  /**
   * The external type of the remote containers.
   */
  remoteType?:
    | 'var'
    | 'module'
    | 'assign'
    | 'this'
    | 'window'
    | 'self'
    | 'global'
    | 'commonjs'
    | 'commonjs2'
    | 'commonjs-module'
    | 'amd'
    | 'amd-require'
    | 'umd'
    | 'umd2'
    | 'jsonp'
    | 'system'
    | 'promise'
    | 'import'
    | 'script'
    | 'node-commonjs'

  /**
   * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
   */
  remotes?: Remotes

  /**
   * The name of the runtime chunk. If set a runtime chunk with this name is created or an existing entrypoint is used as runtime.
   */
  // runtime?: string | false

  /**
   * Share scope name used for all shared modules (defaults to 'default').
   */
  shareScope?: string

  /**
   * Modules that should be shared in the share scope. When provided, property names are used to match requested modules in this compilation.
   */
  shared?: Shared

  /**
   * Current operating mode
   */
  mode?: string
}

type Exposes = (string | ExposesObject)[] | ExposesObject

type Remotes = (string | RemotesObject)[] | RemotesObject

type Shared = (string | SharedObject)[] | SharedObject

type ConfigTypeSet = ExposesConfig | RemotesConfig | SharedConfig

declare interface SharedRuntimeInfo {
  id: string
  dependencies: string[]
  fileName: string
  fileDir: string
  filePath: string
  chunk: RenderedChunk
}

/**
 * Modules that should be exposed by this container. Property names are used as public paths.
 */
declare interface ExposesObject {
  [index: string]: ExposesConfig | string | string[]
}

/**
 * Advanced configuration for modules that should be exposed by this container.
 */
declare interface ExposesConfig {
  /**
   * Request to a module that should be exposed by this container.
   */
  import: string

  /**
   * Custom chunk name for the exposed module.
   */
  name?: string

  /**
   * If false, the link element with styles is put in <head> element. If true, the href argument of all links objects
   * are put under global window object and can be retrieved by the component. It's for using with ShadowDOM, when
   * the component must place the styles inside the ShadowDOM instead of the <head> element.
   */
  dontAppendStylesToHead?: boolean
}

/**
 * Options for library.
 */
declare interface LibraryOptions {
  /**
   * Add a comment in the UMD wrapper.
   *
   */
  auxiliaryComment?: string | LibraryCustomUmdCommentObject

  /**
   * Specify which export should be exposed as library.
   *
   */
  export?: string | string[]

  /**
   * The name of the library (some types allow unnamed libraries too).
   *
   */
  name?: string | string[] | LibraryCustomUmdObject

  /**
   * Type of library (types included by default are 'var', 'module', 'assign', 'assign-properties', 'this', 'window', 'self', 'global', 'commonjs', 'commonjs2', 'commonjs-module', 'amd', 'amd-require', 'umd', 'umd2', 'jsonp', 'system', but others might be added by plugins).
   *
   */
  type: string

  /**
   * If `output.libraryTarget` is set to umd and `output.library` is set, setting this to true will name the AMD module.
   *
   */
  umdNamedDefine?: boolean
}

/**
 * Set explicit comments for `commonjs`, `commonjs2`, `amd`, and `root`.
 */
declare interface LibraryCustomUmdCommentObject {
  /**
   * Set comment for `amd` section in UMD.
   */
  amd?: string

  /**
   * Set comment for `commonjs` (exports) section in UMD.
   */
  commonjs?: string

  /**
   * Set comment for `commonjs2` (module.exports) section in UMD.
   */
  commonjs2?: string

  /**
   * Set comment for `root` (global variable) section in UMD.
   */
  root?: string
}

/**
 * Description object for all UMD variants of the library name.
 */
declare interface LibraryCustomUmdObject {
  /**
   * Name of the exposed AMD library in the UMD.
   */
  amd?: string

  /**
   * Name of the exposed commonjs export in the UMD.
   */
  commonjs?: string

  /**
   * Name of the property exposed globally by a UMD library.
   */
  root?: string | string[]
}

/**
 * Container locations from which modules should be resolved and loaded at runtime. Property names are used as request scopes.
 */
declare interface RemotesObject {
  [index: string]: string | RemotesConfig | string[] | Promise<any>
}

/**
 * Advanced configuration for container locations from which modules should be resolved and loaded at runtime.
 */
declare interface RemotesConfig {
  /**
   * Container locations from which modules should be resolved and loaded at runtime.
   */
  external: string

  /**
   * The format of the specified external
   */
  externalType: 'url' | 'promise'

  /**
   * The name of the share scope shared with this remote.
   */
  shareScope?: string

  /**
   * the remote format
   */
  format?: 'esm' | 'systemjs' | 'var'

  /**
   * from
   */
  from?: 'vite' | 'webpack'
}

/**
 * Modules that should be shared in the share scope. Property names are used to match requested modules in this compilation. Relative requests are resolved, module requests are matched unresolved, absolute paths will match resolved requests. A trailing slash will match all requests with this prefix. In this case shareKey must also have a trailing slash.
 */
declare interface SharedObject {
  [index: string]: string | SharedConfig
}

/**
 * Advanced configuration for modules that should be shared in the share scope.
 */
declare interface SharedConfig {
  /**
   * Include the provided and fallback module directly instead behind an async request. This allows to use this shared module in initial load too. All possible shared modules need to be eager too.
   */
  // eager?: boolean

  /**
   * Provided module that should be provided to share scope. Also acts as fallback module if no shared module is found in share scope or version isn't valid. Defaults to the property name.
   */
  import?: boolean

  /**
   * Package name to determine required version from description file. This is only needed when package name can't be automatically determined from request.
   */
  // packageName?: string

  /**
   * Specify the path to the custom package, the field is not supported in dev mode
   */
  packagePath?: string | undefined

  /**
   * Version requirement from module in share scope.
   */
  requiredVersion?: string | false

  /**
   * Module is looked up under this key from the share scope.
   */
  // shareKey?: string

  /**
   * Share scope name.
   */
  shareScope?: string

  /**
   * Allow only a single version of the shared module in share scope (disabled by default).
   */
  // singleton?: boolean

  /**
   * Do not accept shared module if version is not valid (defaults to yes, if local fallback module is available and shared module is not a singleton, otherwise no, has no effect if there is no required version specified).
   */
  // strictVersion?: boolean

  /**
   * Version of the provided module. Will replace lower matching versions, but not higher.
   */
  version?: string | false

  /**
   * determine whether to include the shared in the chunk, true is included, false will not generate a shared chunk, only the remote side of the parameter is valid, the host side will definitely generate a shared chunk
   */
  generate?: boolean
}
