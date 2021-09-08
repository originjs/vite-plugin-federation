<p align="center">
  <a href="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml"><img src="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml/badge.svg?branch=main" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/v/@originjs/vite-plugin-federation" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/@originjs/vite-plugin-federation" alt="License"></a>
 </p>


# vite-plugin-federation


一个支持模块联邦的 Vite 插件
灵感来源于 Webpack [Module Federation](https://webpack.js.org/concepts/module-federation/) 特性.


## 安装


使用 npm:


```
npm install @originjs/vite-plugin-federation --save-dev
```

## 使用

使用 federation 主要分为几个步骤：

### 步骤一：修改配置


- 使用 Vite 构建的项目, 修改 `vite.config.js`文件:


```js
import { defineConfig } from 'vite'
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    federation({
      name: 'module-name',
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button.vue',
      },
      remotes:{
          foo: 'remote_foo'
      }
      shared: ['vue']
    })
  ],
})


```




- 使用 Rollup 构建的项目, 修改`rollup.config.js`文件:


```js
import federation from '@originjs/vite-plugin-federation'


export default {
  input: 'src/index.js',
  output: {
    format: 'esm',
    dir: 'dist'
  },
  plugins: [
    federation({
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/button'
      },
      shared: ['react']
    })
  ]
}
```

### 步骤二：异步引用

vue2 为例

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

```
<template>
  <div>
  		<RemoteButtonScoped />
  </div>
</template>
```





## 配置项说明

- name：作为远程模块的模块名称，必填。

- filename：作为远程模块的入口文件，非必填，默认为`remoteEntry.js`

- exposes：作为远程模块，对外暴露的组件列表，远程模块必填。

  ```js
  exposes: {
      // '对外暴露的组件名称':'对外暴露的组件地址'
      './remote-simple-button': './src/components/Button.vue',
      './remote-simple-section': './src/components/Section.vue'
  },
  ```

- remotes：作为本地模块，引用的远端模块入口文件

  ```js
  remotes: {
      // '远端模块名称':'远端模块入口文件地址'
      'remote-simple': 'http://localhost:5011/remoteEntry.js',
  },
  ```

- shared：本地模块和远程模块共享的依赖。本地模块需配置所有使用到的远端模块的依赖；远端模块需要配置对外提供的组件的依赖。

## 例子


- [basic-host-remote](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/basic-host-remote)
- [simple-react](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react)
- [vue3-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo)
- [vue2-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue2-demo)

## 构建

vite-plugin-federation 在开发构建过程正需要依赖，建议全局安装。

- rollup
- vite

部分 example 需要依赖，建议全局安装。

- lerna
- rimraf

Github CI 构建，非工程必备：

- playwright-chromium

## Wiki
[设计架构](https://github.com/originjs/vite-plugin-federation/wiki)
