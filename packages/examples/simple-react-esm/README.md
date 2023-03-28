# React - Module Federation Demo

This example demos consumption of federated modules from a rollup bundle. `remote` app depends on a component exposed by `host` app.

## Running Demo

First, `cd packages/examples/simple-react-esm`, then run `pnpm build` and `pnpm serve`. This will build and serve both `host` and `remote` on ports 5000, 5001 respectively.

- HOST (host): [localhost:5000](http://localhost:5000/)
- REMOTE (remote): [localhost:5001](http://localhost:5001/)

`CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.
