# Basic Rollup Module Federation Example

This repository is to showcase examples of how Module Federation can be used in rollup.

## Running Demo
First, `cd packages\examples\basic-host-remote`, then run `pnpm build` and `pnpm serve`. This will build and serve both `host` and `remote` on ports 5000, 5001 respectively.

- HOST (rollup-host): [localhost:5000](http://localhost:5000/)
- REMOTE (rollup-remote): [localhost:5001](http://localhost:5001/)

`CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.
