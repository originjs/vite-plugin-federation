# vite-plugin-federation

A Vite/Rollup plugin which support Module Federation.
Inspired by Webpack and compatible with [Webpack Module Federation](https://webpack.js.org/concepts/module-federation/).

## Install

```
npm install @originjs/vite-plugin-federation --save-dev
```

or

```
yarn add @originjs/vite-plugin-federation --dev
```

## Usage
Using the `Module Federation` usually requires more than 2 projects, one as the `host side` and one as the `remote side`.
#### Step 1: Configure the remote side.
- for a vite project, modify `vite.config.js`:

```js
// vite.config.js
import federation from "@originjs/vite-plugin-federation";
export default {
    plugins: [
        federation({
            name: 'remote-app',
            filename: 'remoteEntry.js',
            // Modules to expose
            exposes: {
                './Button': './src/Button.vue',
            },
            shared: ['vue']
        })
    ]
}
```

- for a rollup project, modify `rollup.config.js`:

```js
// rollup.config.js
import federation from '@originjs/vite-plugin-federation'
export default {
    input: 'src/index.js',
    plugins: [
        federation({
            name: 'remote-app',
            filename: 'remoteEntry.js',
            // Modules to expose
            exposes: {
                './Button': './src/button'.
            },
            shared: ['vue']
        })
    ]
}
```

#### Step 2: Configure the host side

- for a vite project, modify `vite.config.js`:

```js
// vite.config.js
import federation from "@originjs/vite-plugin-federation";
export default {
    plugins: [
        federation({
            name: 'host-app',
            remotes: {
                remote_app: "http://localhost:5001/assets/remoteEntry.js",
            },
            shared: ['vue']
        })
    ]
}
```

- for a rollup project, modify `rollup.config.js`:

```js
// rollup.config.js
import federation from '@originjs/vite-plugin-federation'
export default {
    input: 'src/index.js',
    plugins: [
        federation({
            name: 'host-app',
            remotes: {
                remote_app: "http://localhost:5001/remoteEntry.js",
            },
            shared: ['vue']
        })
    ]
}
```

#### Step 3: Using remote modules on the host side

Using a Vue project as an example

```js
import { createApp, defineAsyncComponent } from "vue";
const app = createApp(Layout);
...
const RemoteButton = defineAsyncComponent(() => import("remote_app/Button"));
app.component("RemoteButton", RemoteButton);
app.mount("#root");
```
Using remote components in templates

```vue
<template>
    <div>
        <RemoteButton />
    </div>
</template>
```

## Example projects

| Examples                                                                                                                                | Host                                  | Remote                              |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | ----------------------------------- |
| [basic-host-remote](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/basic-host-remote)                   | `rollup`+`esm`                        | `rollup`+`esm`                      |
| [react-in-vue](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/react-in-vue)                             | `vite`+`esm`                          | `vite`+`esm`                        |
| [simple-react-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-esm)                     | `rollup`+`esm`                        | `rollup`+`esm`                      |
| [simple-react-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-systemjs)           | `rollup`+`systemjs`                   | `rollup`+`systemjs`                 |
| [simple-react-webpack](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/simple-react-webpack)             | `rollup`+`systemjs`                   | `webpack`+`systemjs`                |
| [vue2-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue2-demo)                                   | `vite`+`esm`                          | `vite`+`esm`                        |
| [vue3-advanced-demo](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-advanced-demo)                 | `vite`+`esm` <br/>`vue-router`/`pinia` | `vite`+`esm`<br/>`vue-router`/`pinia` |
| [vue3-demo-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-esm)                           | `vite`+`esm`                          | `vite`+`esm`                        |
| [vue3-demo-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-systemjs)                 | `vite`+`systemjs`                     | `vite`+`systemjs`                   |
| [vue3-demo-webpack-esm-esm](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-esm)   | `vite/webpack`+`esm`                  | `vite/webpack`+`esm`                |
| [vue3-demo-webpack-esm-var](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-esm-var)   | `vite`+`esm`                          | `webpack`+`var`                     |
| [vue3-demo-webpack-systemjs](https://github.com/originjs/vite-plugin-federation/tree/main/packages/examples/vue3-demo-webpack-systemjs) | `vite`+`systemjs`                     | `webpack`+`systemjs`                |