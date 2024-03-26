# Vue3 Module Federation Demo

This example demos consumption of federated modules from a vite bundle. `layout` app depends on components exposed by `home`, `common-lib` and `css-modules` app.

## Running Demo

1. Clone [originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation) if you haven't already.
1. At the repository root, install dependencies (`pnpm install`) and build (`pnpm build`).
1. Go to this example folder: `cd packages\examples\vue3-demo-systemjs`
1. Run `pnpm install`, `pnpm build` and `pnpm serve` . This will build and serve `layout`, `home`, `common-lib` and `css-modules` on ports 5000, 5001, 5002, 5003 respectively:
    - HOST (layout): [localhost:5000](http://localhost:5000/)
    - REMOTE (home): [localhost:5001](http://localhost:5001/)
    - REMOTE (common-lib): [localhost:5002](http://localhost:5002/)
    - REMOTE (css-modules): [localhost:5003](http://localhost:5003/)

`CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.
