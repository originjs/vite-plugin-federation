## [1.3.2](https://github.com/originjs/vite-plugin-federation/compare/v1.3.1...v1.3.2) (2023-09-28)


### Bug Fixes

* Flatten module with default exports when available ([#505](https://github.com/originjs/vite-plugin-federation/issues/505)) ([0bc4f8e](https://github.com/originjs/vite-plugin-federation/commit/0bc4f8ec9eb7105121da823d406cfd071f7f4b65))


### Features

* add content hash for shared libraries ([#487](https://github.com/originjs/vite-plugin-federation/issues/487)) ([055c759](https://github.com/originjs/vite-plugin-federation/commit/055c7591a83a1bec6aba82da2b19729c45d7f731))



## [1.3.1](https://github.com/originjs/vite-plugin-federation/compare/v1.2.3...v1.3.1) (2023-09-11)


### Bug Fixes

* improve getSharedFromXXX detect need unwrap module V2 ([#447](https://github.com/originjs/vite-plugin-federation/issues/447)) ([72d9b5a](https://github.com/originjs/vite-plugin-federation/commit/72d9b5ad9bc71f3906ec18f11f45944b14bdfafc))
* stop reading server configuration when no shared ([#470](https://github.com/originjs/vite-plugin-federation/issues/470)) ([38af31f](https://github.com/originjs/vite-plugin-federation/commit/38af31f6095363f62f4d780bdefd698d8ac60f59))


### Features

* dynamic loading of remote support & test demo ([#481](https://github.com/originjs/vite-plugin-federation/issues/481)) ([72a1223](https://github.com/originjs/vite-plugin-federation/commit/72a1223c55ff786d3c21f0af6146c450cd42e708))
* support multi-config for plugin ([#469](https://github.com/originjs/vite-plugin-federation/issues/469)) ([d1b9fd4](https://github.com/originjs/vite-plugin-federation/commit/d1b9fd4962d35c0cc1c5d451114b38f21bba4c40))



## [1.2.3](https://github.com/originjs/vite-plugin-federation/compare/v1.2.2...v1.2.3) (2023-05-16)


### Bug Fixes

* **dev:** vite --mode always overrides configured mode ([#405](https://github.com/originjs/vite-plugin-federation/issues/405)) ([5f899df](https://github.com/originjs/vite-plugin-federation/commit/5f899dfb960c309b508149cc9b80cf3b50c5cff7)), closes [#404](https://github.com/originjs/vite-plugin-federation/issues/404)
* monorepo source dependency not found ([#419](https://github.com/originjs/vite-plugin-federation/issues/419)) ([0d91439](https://github.com/originjs/vite-plugin-federation/commit/0d9143944642e1a68405b5258bec1e68de076edf))
* remote shared generate: false not work V3 ([#399](https://github.com/originjs/vite-plugin-federation/issues/399)) ([880f027](https://github.com/originjs/vite-plugin-federation/commit/880f027c578f2f13b577536536104a1a747a15b0))



## [1.2.2](https://github.com/originjs/vite-plugin-federation/compare/v1.2.1...v1.2.2) (2023-04-08)


### Bug Fixes

* dev mode error because of not js type related files ([#372](https://github.com/originjs/vite-plugin-federation/issues/372)) ([9c19ef4](https://github.com/originjs/vite-plugin-federation/commit/9c19ef4de01b30d0e97722f50900906d5e58799f))
* expose the module error which is under node_modules ([#377](https://github.com/originjs/vite-plugin-federation/issues/377)) ([8d7d85a](https://github.com/originjs/vite-plugin-federation/commit/8d7d85ae216f0193b0608830b2f607ff2560c364))
* generate correct source_map when use remote code ([#366](https://github.com/originjs/vite-plugin-federation/issues/366)) ([7956508](https://github.com/originjs/vite-plugin-federation/commit/7956508b5921877b4e956d5feb4adc4eda48a7e2))
* wrong shared url is generated when server.origin is configured and  dev mode. ([#383](https://github.com/originjs/vite-plugin-federation/issues/383)) ([f67f003](https://github.com/originjs/vite-plugin-federation/commit/f67f003076acaf7837979415f29f1e2c25fd2630))



## [1.2.1](https://github.com/originjs/vite-plugin-federation/compare/v1.2.0...v1.2.1) (2023-02-18)


### Bug Fixes

* default and named import case ([#353](https://github.com/originjs/vite-plugin-federation/issues/353)) ([f389cf9](https://github.com/originjs/vite-plugin-federation/commit/f389cf92940b0e0e9200ae06c9a3371775619500))


### Features

* reduce lib semver chunk ([#350](https://github.com/originjs/vite-plugin-federation/issues/350)) ([381f383](https://github.com/originjs/vite-plugin-federation/commit/381f383355c6084da698427da362f2ca816988a5))



# [1.2.0](https://github.com/originjs/vite-plugin-federation/compare/v1.1.14...v1.2.0) (2023-02-11)


### Bug Fixes

* added catch when loading js with import(...) ([#328](https://github.com/originjs/vite-plugin-federation/issues/328)) ([97ed8f7](https://github.com/originjs/vite-plugin-federation/commit/97ed8f7c74535260fa3d91a31b697ea4499eaccd))
* shared lib load failed ([#338](https://github.com/originjs/vite-plugin-federation/issues/338)) ([49b6cae](https://github.com/originjs/vite-plugin-federation/commit/49b6caebbef899abf18cd8d62f64261aac6a18cd))



## [1.1.14](https://github.com/originjs/vite-plugin-federation/compare/v1.1.13...v1.1.14) (2023-01-19)


### Bug Fixes

* dev mode shared version is undefined ([9c21c15](https://github.com/originjs/vite-plugin-federation/commit/9c21c15679e97a00549ce597b83ebe15fa42744e))
* got the wrong package.json file path in build mode ([#320](https://github.com/originjs/vite-plugin-federation/issues/320)) ([32e266e](https://github.com/originjs/vite-plugin-federation/commit/32e266e3ea30fa60bccad10dd37a574d34afefea))


### Features

* throw error when exposes.import is invalid ([#323](https://github.com/originjs/vite-plugin-federation/issues/323)) ([57c6bc5](https://github.com/originjs/vite-plugin-federation/commit/57c6bc500cd7dbe4231dd1f108bc6204a1bc6329))



## [1.1.13](https://github.com/originjs/vite-plugin-federation/compare/v1.1.12...v1.1.13) (2023-01-06)


### Bug Fixes

* Invalid remoteEntry.js when building in watch mode ([5fc029d](https://github.com/originjs/vite-plugin-federation/commit/5fc029df6a560c88adf7cbd047e9800c1fe10ee6)), closes [#253](https://github.com/originjs/vite-plugin-federation/issues/253)
* the style is missing ([#302](https://github.com/originjs/vite-plugin-federation/issues/302)) ([9a71a45](https://github.com/originjs/vite-plugin-federation/commit/9a71a45c04a7e5bb069eada0a4899eda2f371235))
* (resolveHostname) Resolve host name and respecting origin ([#308](https://github.com/originjs/vite-plugin-federation/issues/308)) ([f0578e](https://github.com/originjs/vite-plugin-federation/commit/f0578e2b02242c84e3570b3fb86c2d3c4888011b)) 


### Features

* add `shared.generate` to determine if a shared file needs to be generated on the remote side ([#311](https://github.com/originjs/vite-plugin-federation/issues/311)) ([5c6689b](https://github.com/originjs/vite-plugin-federation/commit/5c6689bbc7d54fcd15fde63e57906ec8e8ab01b2))



## [1.1.12](https://github.com/originjs/vite-plugin-federation/compare/v1.1.11...v1.1.12) (2022-12-08)


### Bug Fixes

* importShared is not a function ([#275](https://github.com/originjs/vite-plugin-federation/issues/275)) ([0b3dfbd](https://github.com/originjs/vite-plugin-federation/commit/0b3dfbdb2d0da4e0116ecf43cbcaf0c2fb025af8))



## [1.1.11](https://github.com/originjs/vite-plugin-federation/compare/v1.1.10...v1.1.11) (2022-10-24)


### Features

* remove invalid import and optimize shared replace ([a85a8ab](https://github.com/originjs/vite-plugin-federation/commit/a85a8abd66989767781162a9e729e674dd231ff8))



## [1.1.10](https://github.com/originjs/vite-plugin-federation/compare/v1.1.9...v1.1.10) (2022-10-14)


### Bug Fixes

* viteDevServer may be undefined in Nuxt ([#240](https://github.com/originjs/vite-plugin-federation/issues/240)) ([415e2b5](https://github.com/originjs/vite-plugin-federation/commit/415e2b5e92ebfb07328df6d3599d1fb08717f2b7)), closes [#239](https://github.com/originjs/vite-plugin-federation/issues/239)
* wrong version of shared lib ([ec1b8ed](https://github.com/originjs/vite-plugin-federation/commit/ec1b8ed426d1b75fd617d4c63617e915a9343037))



## [1.1.9](https://github.com/originjs/vite-plugin-federation/compare/v1.1.8...v1.1.9) (2022-08-19)


### Bug Fixes

* build warning when opening soucemap ([3a7385c](https://github.com/originjs/vite-plugin-federation/commit/3a7385ca35936c508223e7a40310825c275605dc))
* exposes with object values ([#233](https://github.com/originjs/vite-plugin-federation/issues/233)) ([7ee9b53](https://github.com/originjs/vite-plugin-federation/commit/7ee9b53a69dfa4ffe01ba0f4fa8085953bf0115a)), closes [#196](https://github.com/originjs/vite-plugin-federation/issues/196)


### Features

* allow custom packages to be shared via packagePath (previously limited to those under node_modules) ([0d095ba](https://github.com/originjs/vite-plugin-federation/commit/0d095ba5efe49ef951a0ad302c32292a2271adfa))
* change to vitest ([18c7906](https://github.com/originjs/vite-plugin-federation/commit/18c7906a4aa0345dc729d238577d3f397e39cd24))
* change to vitest ([d50a9d1](https://github.com/originjs/vite-plugin-federation/commit/d50a9d1764f7d11fb3a6873d3703d23aa8a0dd2a))
* support rollup v3.0 ([#230](https://github.com/originjs/vite-plugin-federation/issues/230)) ([5fb0a31](https://github.com/originjs/vite-plugin-federation/commit/5fb0a31f7ff0e09e17f31fd0d3621db5aa9e1226))
* upgrade to vite 3.0 ([cf9c9ed](https://github.com/originjs/vite-plugin-federation/commit/cf9c9ed720aae6c7408235740c572d652a21b5ac))



## [1.1.8](https://github.com/originjs/vite-plugin-federation/compare/v1.1.7...v1.1.8) (2022-08-01)


### Bug Fixes

* update content hash calculate for export module ([e2bccc1](https://github.com/originjs/vite-plugin-federation/commit/e2bccc1cf58b9f18ac1a6c27e417e4f1a8870595))



## [1.1.7](https://github.com/originjs/vite-plugin-federation/compare/v1.1.6...v1.1.7) (2022-07-09)


### Features

* **dev:** added content hash for exposed modules ([#198](https://github.com/originjs/vite-plugin-federation/issues/198)) ([2182b31](https://github.com/originjs/vite-plugin-federation/commit/2182b316dd1cdff09de18c1d439cb32e3de21482))



## [1.1.6](https://github.com/originjs/vite-plugin-federation/compare/v1.1.5...v1.1.6) (2022-05-10)


### Bug Fixes

* vite 2.9.0 causes manualChunks failed ([#183](https://github.com/originjs/vite-plugin-federation/issues/183)) ([3fa77a3](https://github.com/originjs/vite-plugin-federation/commit/3fa77a3bd590627c2c9757015d546d68e69a9316))


### Features

* transformed AST node type ExportNamedDeclaration ([0d4b8c6](https://github.com/originjs/vite-plugin-federation/commit/0d4b8c6385060986b4ad54259e31015448dacfc1))



## [1.1.5](https://github.com/originjs/vite-plugin-federation/compare/v1.1.4...v1.1.5) (2022-04-26)


### Features

* add dynamic field `externalType` and demo ([1f0ddf6](https://github.com/originjs/vite-plugin-federation/commit/1f0ddf6c9adaa533f777dc6b4b3ad7fd1edab5e5))



## [1.1.4](https://github.com/originjs/vite-plugin-federation/compare/v1.1.3...v1.1.4) (2022-04-12)


### Bug Fixes

* overwrite the expose's id to synchronize with building context ([#158](https://github.com/originjs/vite-plugin-federation/issues/158)) ([3be750b](https://github.com/originjs/vite-plugin-federation/commit/3be750bec6f7bc33203a92fbad95f65c510dcbde))
* react shared problems ([#166](https://github.com/originjs/vite-plugin-federation/issues/166)) ([4bb26ce](https://github.com/originjs/vite-plugin-federation/commit/4bb26ce660abf6443d3d1c0cbb795438881f0acf)), closes [#161](https://github.com/originjs/vite-plugin-federation/issues/161) [#161](https://github.com/originjs/vite-plugin-federation/issues/161)
* regexp of dynamic css matchs double quotes(") ([74f6941](https://github.com/originjs/vite-plugin-federation/commit/74f69413b37f1b77acf0f3df31124d3c79b582d5))


### Features

* enable dynamic remote loading ([#163](https://github.com/originjs/vite-plugin-federation/issues/163)) ([1cd75ff](https://github.com/originjs/vite-plugin-federation/commit/1cd75ffaec409bb81f15bda0d6e3543c91e81cd4))



## [1.1.3](https://github.com/originjs/vite-plugin-federation/compare/v1.1.2...v1.1.3) (2022-03-23)


### Bug Fixes

* exposed component imports other components that do not handle shared properly ([52f8b65](https://github.com/originjs/vite-plugin-federation/commit/52f8b6553d3136c06714f874ed2f2724512b8ad8))
* share names with special characters fail to integrate with webpack ([5421ece](https://github.com/originjs/vite-plugin-federation/commit/5421ece7719bf93445494119b82d6e1978bfb5ee))



## [1.1.2](https://github.com/originjs/vite-plugin-federation/compare/v1.1.1...v1.1.2) (2022-03-07)


### Bug Fixes

* fix the default import for esm ([6085594](https://github.com/originjs/vite-plugin-federation/commit/6085594cead17943f4d8f8c8af47a1f67db22ed1))


### Features

* support static import ([f882f22](https://github.com/originjs/vite-plugin-federation/commit/f882f222bdd20b84a6ee23e8c7c56350558a7e59))



## [1.1.1](https://github.com/originjs/vite-plugin-federation/compare/v1.1.0...v1.1.1) (2022-03-03)


### Bug Fixes

* dev mode error ([47d76c7](https://github.com/originjs/vite-plugin-federation/commit/47d76c730e8abf4f834c8b66889c5421463c0e47))


### Features

* add `registerPlugins` support command & chore ts ([c374843](https://github.com/originjs/vite-plugin-federation/commit/c37484382127ea51d690291ab439648b52179082))
* shared supports monoRepo ([c629a09](https://github.com/originjs/vite-plugin-federation/commit/c629a0972222d59ab878cf72b3398d6ed9853df7))
* support webpack using vite component([7f7ceacf](https://github.com/originjs/vite-plugin-federation/commit/7f7ceacf2baa808677f6e1a0d3b390b12dba0b37))



# [1.1.0](https://github.com/originjs/vite-plugin-federation/compare/v1.0.8...v1.1.0) (2021-12-13)


### Features

* add semver build ([5c6f9f5](https://github.com/originjs/vite-plugin-federation/commit/5c6f9f522f4ecc378d00f28722f8fe74ce7db925))



## [1.0.8](https://github.com/originjs/vite-plugin-federation/compare/v1.0.7...v1.0.8) (2021-12-07)


### Bug Fixes

* cant find module semver with pnpm build ([2951a9a](https://github.com/originjs/vite-plugin-federation/commit/2951a9aaef37cc0f99764ba5df4c9fc868e89b68))



## [1.0.7](https://github.com/originjs/vite-plugin-federation/compare/v1.0.6...v1.0.7) (2021-12-06)


### Bug Fixes

* federation will override vite `config.optimizeDeps` ([37f4e56](https://github.com/originjs/vite-plugin-federation/commit/37f4e56b65aca67bba75f51e0b8be2798c14cbc6))


### Features

* support webpack var format ([ed2a596](https://github.com/originjs/vite-plugin-federation/commit/ed2a596a2ee20f74310e9a1e8a59a80a538b7afc))



## [1.0.6](https://github.com/originjs/vite-plugin-federation/compare/v1.0.5...v1.0.6) (2021-12-01)


### Bug Fixes

* empty dep error ([3affe92](https://github.com/originjs/vite-plugin-federation/commit/3affe92b714c10ff0869ca7a2a3876b27b2f22e2))


### Features

* plugin support webpack component ([372c69c](https://github.com/originjs/vite-plugin-federation/commit/372c69ca1a0fb6a0c333309d84b21d37fa22587b))
* remove rollup generated empty import(import 'filename.js') ([#101](https://github.com/originjs/vite-plugin-federation/issues/101)) ([cdc5db4](https://github.com/originjs/vite-plugin-federation/commit/cdc5db4ae32f76a1147a3f6d4516f140b06b7648))



## [1.0.5](https://github.com/originjs/vite-plugin-federation/compare/v1.0.4...v1.0.5) (2021-11-22)


### Bug Fixes

* shared import fails if shared library name contains '@' or '/'(serve mode) ([#100](https://github.com/originjs/vite-plugin-federation/issues/100)) ([fb989e9](https://github.com/originjs/vite-plugin-federation/commit/fb989e94301ce8dc3b87bca603c3759cd86714b1))


### Features

* switch to pnpm ([#98](https://github.com/originjs/vite-plugin-federation/issues/98)) ([3ec352a](https://github.com/originjs/vite-plugin-federation/commit/3ec352a1f62b833fac5bd2e03bf7e7cd6e2ad387))



## [1.0.4](https://github.com/originjs/vite-plugin-federation/compare/v1.0.3...v1.0.4) (2021-11-18)


### Bug Fixes

* dev mode throw error ([#96](https://github.com/originjs/vite-plugin-federation/issues/96)) ([3a37701](https://github.com/originjs/vite-plugin-federation/commit/3a377015ae0e09d650fbef4a2de1178bcd17a5c1))



## [1.0.3](https://github.com/originjs/vite-plugin-federation/compare/v1.0.2...v1.0.3) (2021-11-17)


### Bug Fixes

* Build error when format is systemjs and minify:true is set ([4ff5523](https://github.com/originjs/vite-plugin-federation/commit/4ff552320ee91b9012ba6b76b09f2c860646fb08))
* dynamic import incorrectly judged as remote component ([#94](https://github.com/originjs/vite-plugin-federation/issues/94)) ([1160a6c](https://github.com/originjs/vite-plugin-federation/commit/1160a6cc13d063574af8a4927fb0b13a07605d11))
* shared is invalid when format is systemjs ([d700be2](https://github.com/originjs/vite-plugin-federation/commit/d700be223c32fcd25089d5e5b1fcd5be299281e7))


### Features

* support `format:systemjs` for rollup and vite ([ea273bb](https://github.com/originjs/vite-plugin-federation/commit/ea273bbbac44acf723d2dc6d550279585a066642))



## [1.0.2](https://github.com/originjs/vite-plugin-federation/compare/v1.0.1...v1.0.2) (2021-11-09)


### Bug Fixes
* typo is readme

### Refactors
+ try to resolve the import failure (#89)


## [1.0.1](https://github.com/originjs/vite-plugin-federation/compare/v1.0.0...v1.0.1) (2021-10-25)


### Bug Fixes

* dynamic import failed ([#86](https://github.com/originjs/vite-plugin-federation/issues/86)) ([3755727](https://github.com/originjs/vite-plugin-federation/commit/37557275b0e5d663aebf4453f9d6f71db8d66e6a))
* shared will also add __rf_import__ dynamic import([3755727](https://github.com/originjs/vite-plugin-federation/commit/37557275b0e5d663aebf4453f9d6f71db8d66e6a))
* missing semver to judge version of shared([3755727](https://github.com/originjs/vite-plugin-federation/commit/37557275b0e5d663aebf4453f9d6f71db8d66e6a))


### Features
* recursive analysis shared dependency to dynamic import([3755727](https://github.com/originjs/vite-plugin-federation/commit/37557275b0e5d663aebf4453f9d6f71db8d66e6a))
* remove unnecessary imports([3755727](https://github.com/originjs/vite-plugin-federation/commit/37557275b0e5d663aebf4453f9d6f71db8d66e6a))
* use emitFile.fileName option instead of file name changes in the output stage([3755727](https://github.com/originjs/vite-plugin-federation/commit/37557275b0e5d663aebf4453f9d6f71db8d66e6a))



# [1.0.0](https://github.com/originjs/vite-plugin-federation/compare/v0.0.3...v1.0.0) (2021-10-13)


### Bug Fixes

* eliminate circular dependencies ([bb93481](https://github.com/originjs/vite-plugin-federation/commit/bb9348130951952955cae2dbb90a7b2be5a5e906))
* remove unnecessary function ([e58d78a](https://github.com/originjs/vite-plugin-federation/commit/e58d78ae60d9a6f344edf4f502ad2d85181c1e2c))


### Features

* add dev mode support ([96edf43](https://github.com/originjs/vite-plugin-federation/commit/96edf43b1ea637b3f5c178431eade5c0b2a08277))
* federation in vite dev mode ([bae2ad6](https://github.com/originjs/vite-plugin-federation/commit/bae2ad65329b25cd97e1c1121b7c6b1214e7d1e0))
* support requiredVersion of shared ([5a3f76c](https://github.com/originjs/vite-plugin-federation/commit/5a3f76c9fe8fd4cd47cc0a946856d36139bad9df))
* support shareScope of shared ([a5e27c3](https://github.com/originjs/vite-plugin-federation/commit/a5e27c30657c5664f7e18a1f1c8e2862a408a9bf))



## [0.0.3](https://github.com/originjs/vite-plugin-federation/compare/v0.0.1...v0.0.3) (2021-09-09)


### Bug Fixes

* close issue [#45](https://github.com/originjs/vite-plugin-federation/issues/45) [#48](https://github.com/originjs/vite-plugin-federation/issues/48) ([6d7c567](https://github.com/originjs/vite-plugin-federation/commit/6d7c567345dfef2e802b6e89382b294aaf81f8d7))
* add testcase for isSameFilepath and fix bugs ([3db8a0d](https://github.com/originjs/vite-plugin-federation/commit/3db8a0dee7510305b7f65277c0995fc4388d0b29))
* circular dependencies bug ([#47](https://github.com/originjs/vite-plugin-federation/issues/47)) ([95be98d](https://github.com/originjs/vite-plugin-federation/commit/95be98db2833f618fbf6bd7b86309a036bc2ef3a))
* dependabot alerts for ecstatic ([ae8d829](https://github.com/originjs/vite-plugin-federation/commit/ae8d829e0f739417499aebb26641e90ef5220ff9))
* fix style bug when build.minify true ([#37](https://github.com/originjs/vite-plugin-federation/issues/37)) ([eb6f9fd](https://github.com/originjs/vite-plugin-federation/commit/eb6f9fd84a2ab615ef18e684ef065ef037672ee5))
* import path error ([069b702](https://github.com/originjs/vite-plugin-federation/commit/069b702d5c5b6997e83f0685c601b1750ce7926f))
* import shared failure ([ca0056d](https://github.com/originjs/vite-plugin-federation/commit/ca0056d49d7b2e81816292bc3af32815364306f3))
* rename export name bug and circular dependency problems(few cases will have problems) ([#43](https://github.com/originjs/vite-plugin-federation/issues/43)) ([e3b75bf](https://github.com/originjs/vite-plugin-federation/commit/e3b75bf9a806a1fd5ddbdf9fe9f103951205c0af))
* shared renderChunk function error ([0870de9](https://github.com/originjs/vite-plugin-federation/commit/0870de92961a4443c23282fabc0a5017b2aa27f5))
* get css file path error ([#67](https://github.com/originjs/vite-plugin-federation/issues/67)) ([0c83750](https://github.com/originjs/vite-plugin-federation/commit/0c8375073ea2193189c4df09486919811585411a))


### Features

* add util of merging options ([#54](https://github.com/originjs/vite-plugin-federation/issues/54)) ([ceae847](https://github.com/originjs/vite-plugin-federation/commit/ceae847c766aee7a334a05119b597d3430ba6674))
* rename filename distinguish vite and rollup ([#49](https://github.com/originjs/vite-plugin-federation/issues/49)) ([32ba2ab](https://github.com/originjs/vite-plugin-federation/commit/32ba2aba47bb84a2f711e4fb556a2bfc27be03f7))
* support import property of shared ([d2ed02a](https://github.com/originjs/vite-plugin-federation/commit/d2ed02a3f04949740dbecc549115daa09aec614a))
* use __rf_fn__import to replace more shared code in exposes ([#55](https://github.com/originjs/vite-plugin-federation/issues/55)) ([3b52e13](https://github.com/originjs/vite-plugin-federation/commit/3b52e13b679157088b940cfe3ad1b50470971457))




## [0.0.1](https://github.com/originjs/vite-plugin-federation/compare/de5f75f8a2377873430443c65d36534564736a2a...v0.0.1) (2021-08-26)


### Bug Fixes

* remote side file path generate error ([#28](https://github.com/originjs/vite-plugin-federation/issues/28)) ([f4f8de1](https://github.com/originjs/vite-plugin-federation/commit/f4f8de1ddb95117eeef6541ef0dc795c863ac6c5))
* vite bug ([#32](https://github.com/originjs/vite-plugin-federation/issues/32)) ([85722b6](https://github.com/originjs/vite-plugin-federation/commit/85722b688a97d066722a8631fdbd1dd0e3dbd68f))


### Features

* add e2e test ([de5f75f](https://github.com/originjs/vite-plugin-federation/commit/de5f75f8a2377873430443c65d36534564736a2a))
* exposes support types ([c967b57](https://github.com/originjs/vite-plugin-federation/commit/c967b5735aa83fb93cf519e5e7e67ab40181ede8))
* remote style split false ([#35](https://github.com/originjs/vite-plugin-federation/issues/35)) ([ef6e6b3](https://github.com/originjs/vite-plugin-federation/commit/ef6e6b3c6d11bbe260c2178fc0bdbf9f68f8da73))
* shared code split ([691b683](https://github.com/originjs/vite-plugin-federation/commit/691b68337426cb4166cce4dc12abb5da6e5ce208))
* shared package full export ([#24](https://github.com/originjs/vite-plugin-federation/issues/24)) ([2e01598](https://github.com/originjs/vite-plugin-federation/commit/2e0159813056574e1e7c3ce014d8574dec58e280)), closes [#25](https://github.com/originjs/vite-plugin-federation/issues/25)
* use manualChunks and input to generate shared lib ([2ffbe1b](https://github.com/originjs/vite-plugin-federation/commit/2ffbe1b7d4ea952ce6e0597ae0cfd2f55ae0a7ea))
* vitePreload cause an external refer error ([#25](https://github.com/originjs/vite-plugin-federation/issues/25)) ([485f9ff](https://github.com/originjs/vite-plugin-federation/commit/485f9ffdf16c450de15f05bb26a8472ed720d434))



