# VueJs Module Federation with Style Demo
This is a project that shows how to attach styles to components
---
# Running Demo
In the `packages/examples/Vue3-demo` folder
Run `pnpm` to install project. 
Run `pnpm build` This will build `common-lib`, `home`, `css-modules` and `layout` on ports 5002, 5001, 5002 and 5000 respectively.
Run `pnpm serve` This will serve `common-lib`, `home`, `css-modules` and `layout` on ports 5002, 5001, 5002 and 5000 respectively.

- HOST (layout): [localhost:5000](http://localhost:5000/)
- REMOTE (home): [localhost:5001](http://localhost:5001/)
- REMOTE (common-lib): [localhost:5002](http://localhost:5002/)
- REMOTE (css-modules): [localhost:5003](http://localhost:5003/)

