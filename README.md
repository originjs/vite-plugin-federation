English | [简体中文](./README-zh.md)
# vite-plugin-federation

<p align="center">
  <a href="https://bestpractices.coreinfrastructure.org/projects/5752"><img src="https://bestpractices.coreinfrastructure.org/projects/5752/badge"></a>
  <a href="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml"><img src="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml/badge.svg?branch=main" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/v/@originjs/vite-plugin-federation" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/@originjs/vite-plugin-federation" alt="License"></a>
 </p>
A Vite plugin which support Module Federation.
Inspired by Webpack [Module Federation](https://webpack.js.org/concepts/module-federation/) feature.

## Application and practice

![image-20211210105354887](https://github.com/originjs/vite-plugin-federation/blob/main/packages/examples/vue3-advanced-demo/README-Preview-Image)

## Install

Using npm:

```
npm install @originjs/vite-plugin-federation --save-dev
```

## Usage
The main steps in using federation are:
### Step 1: change the configuration
- for a Vite project, in `vite.config.js`:

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

- for a Rollup project, in `rollup.config.js`:

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

### Step 2: asynchronous references

Vue2, for example

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



### Step 3: Use Remote module components

Vue2, for example

```
<template>
  <div>
  		<RemoteButtonScoped />
  </div>
</template>
```

## Configuration description

### exposes
#### `name: string`

<br>

Required as the module name of the remote module.

****

#### `filename:string`

<br>

As the entry file of the remote module, not required, default is `remoteEntry.js`

As the remote module, the list of components exposed to the public, required for the remote module.
```js
exposes: {
// 'externally exposed component name': 'externally exposed component address'
    '. /remote-simple-button': '. /src/components/Button.vue',
        '. /remote-simple-section': '. /src/components/Section.vue'
},
```
### remotes

The remote module entry file referenced as a local module
> configuration information
#### `external:string|Promise<string>`

<br>

remote module address, e.g. https://localhost:5011/remoteEntry.js
You can simply configure it as follows

  ```js
  remotes: {
    // 'remote module name': 'remote module entry file address'
    'remote-simple': 'http://localhost:5011/remoteEntry.js',
}
  ```
Or do a slightly more complex configuration, if you need to use other fields
``` javascript
remotes: {
    remote-simple: {
        external: 'http://localhost:5011/remoteEntry.js',
        format: 'var',
    }
}
```
#### `enternalType: 'url'|'promise'`

`default: 'url'`

<br>

set the type of external

If you want to use a dynamic url address, you can set the `external` as `promise`, but please note that you need to set the `externalType` as 'promise' at the same time, and please ensure that the code of the `promise` part is correct, otherwise the package may fail,here is a simple example.

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
#### `format:'esm'|'systemjs'|'var'`

`default:'esm'`
<br>
Specify the format of the remote component, this is more effective when the host and the remote use different packaging formats, for example the host uses vite + esm and the remote uses webpack + var, in which case you need to specify `type` : `'var'`

****

#### `from` : `'vite'|'webpack'`

`default : 'vite'`
<br>

Specify the source of the remote component, from `vite-plugin-federation` select `vite`, from `webpack` select `webpack`

### shared

Dependencies shared by local and remote modules. Local modules need to configure the dependencies of all used remote modules; remote modules need to configure the dependencies of externally provided components.
> configuration information
#### `import: boolean`

`default: true`

<br>

The default is `true`, whether to add shared to the module, only for the `remote` side, `remote` will reduce some of the packaging time when this configuration is turned on, because there is no need to package some of the `shared`, but once there is no `shared` module available on the `host` side, it will report an error directly, because there is no fallback module available

****

#### `shareScope: string`

`default: 'default'`

<br>

Default is `defualt`, the shared domain name, just keep the `remote` and `host` sides the same

****

#### `version: string`

<br>

Only works on `host` side, the version of the shared module provided is `version` of the `package.json` file in the shared package by default, you need to configure it manually only if you can't get `version` by this method

****

#### `requiredVersion: string`

<br>

Only for the `remote` side, it specifies the required version of the `host shared` used, when the version of the `host` side does not meet the `requiredVersion` requirement, it will use its own `shared` module, provided that it is not configured with `import=false`, which is not enabled by default
## Examples
+ [basic-host-remote](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/basic-host-remote)
+ [simple-react-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-esm)
+ [vue3-demo-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-esm)
+ [vue2-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue2-demo)
+ [vue3-advanced-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-advanced-demo)


## Construct

vite-plugin-federation dependencies are required during the development and build process, and global installation is recommended.

- rollup
- vite

Part of example requires dependencies, recommended for global installation.

- lerna
- rimraf

Github CI build, not engineering required:

- playwright-chromium


## Development mode

Since Vite is esbuild-based in development mode, we provide separate support for the development mode to leverage Vite’s high-performance development capabilities in the case of remote module deployment. And note that only Host supports the dev mode and Remote supports only build mode

## Integration with webpack

⚠️: Please don't use heterogeneous components in `React` projects (e.g. `vite` using `webpack` components or vice versa), because there is no guarantee that `vite/rollup` and `webpack` will convert `export` consistent `chunk` when packaging the `commonjs` framework, which is a prerequisite for using ` shared` is a prerequisite for using

Now you can use `federation` without the restrictions of `vite` and `webpack`, that is, you can choose to use the `vit-plugin-federation` component in `webpack` or the `webpack-module- federation` in `vite`, but you need to pay attention to the configuration in `remotes`, for different frameworks you need to specify `remotes.from` and `remotes.format` to make them work better, the currently supported format pairings are as follows.

| host                     | remote                   | demo                                                                                                                                  |
| ------------------------ | ------------------------ |---------------------------------------------------------------------------------------------------------------------------------------|
| `rollup/vite`+`esm`      | `rollup/vite`+`esm`      | [simple-react-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-esm)                   |
| `rollup/vite`+`systemjs` | `rollup/vite`+`systemjs` | [vue3-demo-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-esm)                         |
| `rollup/vite`+`systemjs` | `webpack`+`systemjs`     | [vue3-demo-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-systemjs)               |
| `rollup/vite`+`esm`      | `webpack`+`var`          | [vue3-demo-webpack-esm-var](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-var) |
| `rollup/vite`+`esm`      | `webpack`+`esm`          | [vue3-demo-webpack-esm-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-esm) |

⚠️: `vite` is relatively easy to use with `webpack` components, but `vite-plugin-federation` components are better in `esm` format when `webpack` uses `vite` components, because other formats temporarily lack test cases to complete the test

## Static Import

Static import is supported at this stage. The following shows the difference between the two methods. You can see `examples` of dynamic import and static import in each project in examples, and here is a simple example.

+ Vue

``` javascript
// dynamic import
const myButton = defineAsyncComponent(() => import('remote/myButton'));
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

The solution is to set `build.target` to `esnext`, which you can find at https://developer.mozilla.org/en-US/docs/ Web/JavaScript/Reference/Operators/await to see the support for this feature in each browser.

```ts
build: {
    target: "esnext"
  }
```



#### is not generating chunk properly?

Please check if you have started the project in `dev` mode with `vite`, currently only the fully pure host side can use `dev` mode, the `remote` side must use `build` mode to make the plugin take effect.



#### React uses federation for some questions

It is recommended to check this [Issue](https://github.com/originjs/vite-plugin-federation/issues/173), which contains most of the `React` related issues



#### The remote module failed to load the share of the local module, for example`localhost/:1 Uncaught (in promise) TypeError: Failed to fetch dynamically imported module: http://your url`

Reason: Vite has auto fetch logic for `IP` and Port when starting the service, no full fetch logic has been found in the `Plugin`, and in some cases a fetch failure may occur.

Solutions：

Explicitly declaring IP, Port, `cacheDir` in the local module ensures that our `Plugin` can correctly fetch and pass the dependent addresses.

Local module's `vite.config.ts`

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

[Design framework](https://github.com/originjs/vite-plugin-federation/wiki)
