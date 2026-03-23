# React - Module Federation Demo

This example demos consumption of federated modules from a rollup bundle. `remote` app depends on a component exposed by `host` app.

## Running Demo

First, `cd packages/examples/simple-react`, then run `pnpm build` and `pnpm serve`. This will build and serve both `host` and `remote` on ports 5020, 5021 respectively.

- HOST (host): [localhost:5020](http://localhost:5020/)
- REMOTE (remote): [localhost:5021](http://localhost:5021/)

`CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.
