[English](./README.md) | 简体中文
# vite-plugin-federation

<p align="center">
  <a href="https://bestpractices.coreinfrastructure.org/projects/5752"><img src="https://bestpractices.coreinfrastructure.org/projects/5752/badge"></a>
  <a href="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml"><img src="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml/badge.svg?branch=main" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/v/@originjs/vite-plugin-federation" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/@originjs/vite-plugin-federation" alt="License"></a>
 </p>

一个支持模块联邦的 Vite 插件
灵感来源于 Webpack [Module Federation](https://webpack.js.org/concepts/module-federation/) 特性.

## 应用与实践

![Preview](./README-Preview.gif)

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
## 限制
Federation当前依赖浏览器支持Top-level await特性，因此需要将配置文件中的build.target设置为next或类似的值，查看Top-level await的[浏览器兼容性](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await#browser_compatibility)

## 配置项说明
### exposes
#### `name：string`

<br>

作为远程模块的模块名称，必填。

****

#### `filename：string`

<br>

作为远程模块的入口文件，非必填，默认为`remoteEntry.js`

作为远程模块，对外暴露的组件列表，远程模块必填。
  ```js
  exposes: {
      // '对外暴露的组件名称':'对外暴露的组件地址'
      './remote-simple-button': './src/components/Button.vue',
      './remote-simple-section': './src/components/Section.vue'
  }
  ```



### remotes

作为本地模块，引用的远端模块入口文件

#### `external:string|Promise<string>`

<br>

远程模块地址，例如：https://localhost:5011/remoteEntry.js
你可以简单地进行如下配置

  ```js
  remotes: {
      // '远端模块名称':'远端模块入口文件地址'
      'remote-simple': 'http://localhost:5011/remoteEntry.js',
  }
  ```
或者做一个稍微复杂的配置，如果你需要使用其他字段的话
```javascript
remotes: {
    remote-simple: {
        external: 'http://localhost:5011/remoteEntry.js',
        format: 'var',
        from: 'webpack'
    }
}
```



### `externalType:'url'|'promise'`

`default:'url'`

设置`external`的类型

如果你想使用动态的URL地址，你可以设置`external`为一个promise，但是请注意需要同时指定`externalType`为'promise'，确保promise部分的代码正确并且返回`string`，否则可能打包失败，这里提供一个简单是示例

``` js
remotes: {
      home: {
          external: `Promise.resolve('your url')`,
          externalType: 'promise'
      },
},
    
// or from networke
remotes: {
    remote-simple: {
        external: `fetch('your url').then(response=>response.json()).then(data=>data.url)`,
        externalType: 'promise'
    }
}
```



***
#### `format` : `'esm'|'systemjs'|'var'`

`default:'esm'`
<br>
指定远程组件的格式，当主机和远程端使用不同的打包格式时，这样做更有效，例如主机使用 `vite` + `esm`，远程使用 `webpack` + `var`，这时需要指定`type:'var'`

***

#### `from` : `'vite'|'webpack'`

`default : 'vite'`

<br>

指定远程组件的来源，来源于 `vite-plugin-federation` 选择 `vite`，来源于 `webpack` 选择 `webpack`



### shared

本地模块和远程模块共享的依赖。本地模块需配置所有使用到的远端模块的依赖；远端模块需要配置对外提供的组件的依赖。

<br>

####  `import: boolean`

`default: true`

<br>

默认为 `true` ，是否加入shared共享该模块，仅对 `remote` 端生效，`remote` 开启该配置后，会减少部分打包时间，因为不需要打包部分` shared`，但是一旦 `host` 端没有可用的 `shared` 模块，会直接报错，因为没有可用的回退模块

****

#### `shareScope: string`

`default: 'default'`

<br>

默认为 `defualt`，共享域名称，保持 `remote` 和 `host` 端一致即可

****

#### `version: string`

<br>

仅对 `host` 端生效，提供的share模块的版本，默认为share包中的 `package.json` 文件的 `version` ，只有当以此法无法获取 `version` 时才需要手动配置

****

####  `requiredVersion: string`

<br>

仅对 `remote` 端生效，规定所使用的 `host shared` 所需要的版本，当 `host` 端的版本不符合 `requiredVersion` 要求时，会使用自己的 `shared` 模块，前提是自己没有配置 `import=false` ，默认不启用该功能



## 例子
+ [basic-host-remote](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/basic-host-remote)
+ [simple-react-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-esm)
+ [simple-react-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-systemjs)
+ [vue3-demo-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-esm)
+ [vue3-demo-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-systemjs)
+ [vue3-demo-webpack-esm-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-esm)
+ [vue3-demo-webpack-esm-var](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-var)
+ [vue3-demo-webpack-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-systemjs)
+ [vue3-advanced-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-advanced-demo)


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

因为 Vite 在 development 模式下是基于 esbuild，所以我们单独提供了对 development 模式的支持，可以在远程模块部署的情况下，利用 Vite 的高性能开发能力。但是需要注意只有Host支持dev模式，Remote暂时只支持build模式

## 与 `Webpack` 集成
⚠️：`React` 项目中请不要使用异构组件（例如 `vite` 使用 `webpack` 的组件或者反之），因为现在还无法保证 `vite/rollup` 和 `webpack` 在打包 `commonjs` 框架时转换出 `export` 一致的 `chunk`，这是使用 `shared` 的先决条件

现在可以不受 `vite` 和 `webpack` 的限制而使用 `federation` 了，也就是说，你可以选择在 `webpack` 中使用 `vit-plugin-federation` 的组件，也可以选择在 `vite` 中使用 `webpack-module-federation` 的组件，但需要注意 `remotes` 中的配置，对于不同的框架，你需要指定 `remotes.from` 和 `remotes.format` ，使它们更好地工作，当前支持的格式搭配如下：

| host                     | remote                   | demo                                                                                                                                  |
| ------------------------ | ------------------------ |---------------------------------------------------------------------------------------------------------------------------------------|
| `rollup/vite`+`esm`      | `rollup/vite`+`esm`      | [simple-react-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-esm)                   |
| `rollup/vite`+`systemjs` | `rollup/vite`+`systemjs` | [vue3-demo-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-esm)                         |
| `rollup/vite`+`systemjs` | `webpack`+`systemjs`     | [vue3-demo-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-systemjs)               |
| `rollup/vite`+`esm`      | `webpack`+`var`          | [vue3-demo-webpack-esm-var](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-var) |
| `rollup/vite`+`esm`      | `webpack`+`esm`          | [vue3-demo-webpack-esm-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-esm) |

⚠️：`vite` 使用 `webpack` 组件相对容易，但是 `webpack` 使用 `vite` 组件时 `vite-plugin-federation` 组件最好是 `esm` 格式，因为其他格式暂时缺少测试用例完成测试



## 静态导入

现阶段已经支持静态导入，下面展示两种方式的区别，你可以在`examples`中的每个项目看到动态导入和静态导入的例子，下面是一个简单的示例：

+ Vue

``` javascript
// dynamic import
const myButton = defineAsyncComponent(() => import('remote/myButton));
app.component('my-button' , myButton);
// or
export default {
  name: 'App',
  components: {
    myButton: () => import('remote/myButton'),
  }
}


// static import
import myButton from 'remote/myButton';
app.component('my-button' , myButton);
// or
export default {
  name: 'App',
  components: {
    myButton: myButton
  }

```



+ React

``` js
// dynamic import
const myButton = React.lazy(() => import('remote/myButton'))

// static import
import myButton from 'remote/myButton'
```



### FAQ

#### ERROR: `Top-level` await is not available in the configured target environment

这是因为插件使用了`top-level-await`特性，当设置的浏览器环境不支持该特性时就会出现该报错，解决办法是将`build.target`设置为`esnext`，你可以在https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await查看各个浏览器对该特性的支持情况。

```js
 build: {
    target: "esnext"
  }
```



#### 没有正常生成chunk？

请检查是否使用`vite`的`dev`模式启动了项目，当前仅有完全纯净的host端才可以使用`dev`模式，`remote`端必须使用`build`模式才能使插件生效。



#### React 使用federation的一些问题

建议查看这个[Issue](https://github.com/originjs/vite-plugin-federation/issues/173)，这里包含了大多数`React`相关的问题



#### 远程模块加载本地模块的共享依赖失败，例如`localhost/:1 Uncaught (in promise) TypeError: Failed to fetch dynamically imported module: http:your url`

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
