# Vue3 Module Federation Demo

This example demos consumption of federated modules from a vite bundle. `layout` app depends on components exposed by `home`, `common-lib` and `css-modules` app.

## Running Demo

First, `cd packages\examples\vue3-demo`, then run `pnpm build` and `pnpm serve` . This will build and serve `layout`, `home`, `common-lib` and `css-modules` on ports 5000, 5001, 5002, 5003 respectively.

- HOST (layout): [localhost:5000](http://localhost:5000/)
- REMOTE (home): [localhost:5001](http://localhost:5001/)
- REMOTE (common-lib): [localhost:5002](http://localhost:5002/)
- REMOTE (css-modules): [localhost:5003](http://localhost:5003/)

`CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.
