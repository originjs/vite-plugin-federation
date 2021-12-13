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



