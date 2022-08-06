# Vue-next 项目使用 vite 的 Module Federation 组件实现样式的组件化
这是一个项目，用于展示如何在组件中附带样式
---
# 运行样例
在 `packages/examples/vue3-demo` 文件夹下
运行 `pnpm` 来安装项目依赖。
运行 `pnpm build` 会编译 `common-lib`, `home`, `css-modules` and `layout` 子工程。
运行 `pnpm serve` 会重启端口对应服务 `common-lib`, `home`, `css-modules` and `layout` 分别对应端口 5002, 5001, 5002 and 5000。

- HOST (layout): [localhost:5000](http://localhost:5000/)
- REMOTE (home): [localhost:5001](http://localhost:5001/)
- REMOTE (common-lib): [localhost:5002](http://localhost:5002/)
- REMOTE (css-modules): [localhost:5003](http://localhost:5003/)

# 待解决
- 当前无法将 style 打包进 对应的 JavaScript 文件中，暂时需要 vite-plugin-federation 提供的支持，将 style 动态引入到 host 的页面中。
- 当前 `build.cssCodeSplit: true` `build.rollupOptions.output.format` 在 `es`, `cjs` 时，会将样式文件分开打包, `iife`, `umd` 报错, `systemjs`, `amd` 导入相应的支持。