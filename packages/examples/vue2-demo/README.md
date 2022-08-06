# Vue2 - Module Federation Demo

This example demos consumption of federated modules from a rollup bundle. `host-simple` app depends on a component exposed by `remote-simple` app.

## Running Demo

First, `cd packages/examples/vue2-demo`, then run `pnpm`, `pnpm build` and `pnpm serve`. This will build and serve both `host-simple` and `remote-simple` on ports 5010, 5011 respectively.

- HOST (host-simple): [localhost:5010](http://localhost:5010/)
- REMOTE (remote-simple): [localhost:5011](http://localhost:5011/)

`CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.
