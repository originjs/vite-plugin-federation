[English](./README.md) | 简体中文
# vite-plugin-federation

<p align="center">
  <a href="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml"><img src="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml/badge.svg?branch=main" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/v/@originjs/vite-plugin-federation" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/@originjs/vite-plugin-federation" alt="License"></a>
 </p>

一个支持模块联邦的 Vite 插件
灵感来源于 Webpack [Module Federation](https://webpack.js.org/concepts/module-federation/) 特性.

## 安装

使用 npm:

```
npm install @originjs/vite-plugin-federation --save-dev
```

## 使用

使用 federation 主要分为几个步骤：

### 步骤一：修改配置
- 使用 Vite 构建的项目, 修改 `vite.config.js`文件:


```js
import { defineConfig } from 'vite'
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    federation({
      name: 'module-name',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.vue',
      },
      remotes:{
          foo: 'remote_foo'
      },
      shared: ['vue']
    })
  ],
})

```

- 使用 Rollup 构建的项目, 修改`rollup.config.js`文件:

```js
import federation from '@originjs/vite-plugin-federation'


export default {
  input: 'src/index.js',
  output: {
    format: 'esm',
    dir: 'dist'
  },
  plugins: [
    federation({
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/button'
      },
      shared: ['react']
    })
  ]
}
```

### 步骤二：异步引用

Vue2 为例

```vue
<script>
export default {
  name: 'App',
  components: {
    RemoteButtonScoped: () => import('remote-simple/remote-simple-button-scoped'),
  }
}
</script>
```



### 步骤三：使用远程模块的组件

vue2 为例

```js
<template>
    <div>
        <RemoteButtonScoped />
    </div>
</template>
```

## 配置项说明
### exposes
#### `name：string`
作为远程模块的模块名称，必填。

#### `filename：string`
作为远程模块的入口文件，非必填，默认为`remoteEntry.js`

作为远程模块，对外暴露的组件列表，远程模块必填。
  ```js
  exposes: {
      // '对外暴露的组件名称':'对外暴露的组件地址'
      './remote-simple-button': './src/components/Button.vue',
      './remote-simple-section': './src/components/Section.vue'
  },
  ```

### remotes
作为本地模块，引用的远端模块入口文件
  ```js
  remotes: {
      // '远端模块名称':'远端模块入口文件地址'
      'remote-simple': 'http://localhost:5011/remoteEntry.js',
  },
  ```

### shared
本地模块和远程模块共享的依赖。本地模块需配置所有使用到的远端模块的依赖；远端模块需要配置对外提供的组件的依赖。
> 配置信息
>
> ####  `import: boolean`

默认为 `true` ，是否加入shared共享该模块，仅对 `remote` 端生效，`remote` 开启该配置后，会减少部分打包时间，因为不需要打包部分` shared`，但是一旦 `host` 端没有可用的 `shared` 模块，会直接报错，因为没有可用的回退模块
#### `shareScope: string`

默认为 `defualt`，共享域名称，保持 `remote` 和 `host` 端一致即可
#### `version: string`

仅对 `host` 端生效，提供的share模块的版本，默认为share包中的 `package.json` 文件的 `version` ，只有当以此法无法获取 `version` 时才需要手动配置
####  `requiredVersion: string`

仅对 `remote` 端生效，规定所使用的 `host shared` 所需要的版本，当 `host` 端的版本不符合 `requiredVersion` 要求时，会使用自己的 `shared` 模块，前提是自己没有配置 `import=false` ，默认不启用该功能
## 例子
+ [basic-host-remote](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/basic-host-remote)
+ [simple-react](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react)
+ [vue3-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo)
+ [vue2-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue2-demo)


## 构建

vite-plugin-federation 在开发构建过程正需要依赖，建议全局安装。

- rollup
- vite

部分 example 需要依赖，建议全局安装。

- lerna
- rimraf

Github CI 构建，非工程必备：

- playwright-chromium

## 开发模式

因为 Vite 在 development 模式下是基于 esbuild，所以我们单独提供了对 development 模式的支持，可以在远程模块部署的情况下，利用 Vite 的高性能开发能力。



### FAQ

#### 远程模块的某个组件无法正常显示，控制台显示“[Vue warn]: Invalid VNode type: Symbol() (symbol)”

本地模块和远端模块加载各自的 vue 会导致引用多个 vue 的问题。

解决：

保持本地模块与远程模块中共享的依赖版本相对一致。

远程模块的 vite.config.ts

```ts
federation({
  name: 'common-lib',
  filename: 'remoteEntry.js',
  exposes: {
	'./CommonCounter': './src/components/CommonCounter.vue',
	'./CommonHeader': './src/components/CommonHeader.vue'
  },
  shared: {
	vue: {
	  requiredVersion:'^2.0.0' // shared 强制使用了过低的版本，删除或修改为 ^3.0.0 即可
	}
  }
})
```



#### 远程模块加载本地模块的共享以来失败，例如`localhost/:1 Uncaught (in promise) TypeError: Failed to fetch dynamically imported module: http://localhost:8080/node_modules/.cacheDir/vue.js?v=4cd35ed0`

原因：Vite 在启动服务时对于 IP、Port 有自动获取逻辑，在 Plugin 中还没有找到完全对应的获取逻辑，在部分情况下可能会出现获取失败。

解决：

在本地模块显式到声明 IP、Port、cacheDir，保证我们的 Plugin 可以正确的获取和传递依赖的地址。

本地模块的 vite.config.ts

```ts
export default defineConfig({
  server:{
    https: "http",
    host: "192.168.56.1",
    port: 5100,
  },
  cacheDir: "node_modules/.cacheDir",
}
```



## Wiki

[设计架构](https://github.com/originjs/vite-plugin-federation/wiki)
