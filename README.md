<p align="center">
  <a href="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml"><img src="https://github.com/originjs/vite-plugin-federation/actions/workflows/ci.yml/badge.svg?branch=main" alt="Build Status"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/v/@originjs/vite-plugin-federation" alt="Version"></a>
  <a href="https://nodejs.org/en/about/releases/"><img src="https://img.shields.io/node/v/vite.svg" alt="Node Compatibility"></a>
  <a href="https://www.npmjs.com/package/@originjs/vite-plugin-federation"><img src="https://badgen.net/npm/license/@originjs/vite-plugin-federation" alt="License"></a>
 </p>

# vite-plugin-federation

A Vite plugin which support Module Federation.
Inspired by Webpack [Module Federation](https://webpack.js.org/concepts/module-federation/) feature.

## Install
Using npm:
```
npm install @originjs/vite-plugin-federation --save-dev
```
## Usage

* for a Vite project, in `vite.config.js`:
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
      }
      shared: ['vue']
    })
  ],
})

```

* for a Rollup project, in `rollup.config.js`:
```js
import federation from "@originjs/vite-plugin-federation";

export default {
  input: "src/index.js",
  output: {
    format: "esm",
    dir: "dist"
  },
  plugins: [
    federation({
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/button"
      },
      shared: ['react']
    }),
  ],
};

```

## Examples
- [basic-host-remote](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/basic-host-remote)
- [simple-react](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react)
- [vue3-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo)