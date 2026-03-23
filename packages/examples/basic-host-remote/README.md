# Basic Rollup Module Federation Example

This repository is to showcase examples of how Module Federation can be used in rollup.

## Running Demo

1. Clone [originjs/vite-plugin-federation](https://github.com/originjs/vite-plugin-federation) if you haven't already.
1. At the repository root, install dependencies (`pnpm install`) and build (`pnpm build`).
1. Go to this example folder: `cd packages\examples\basic-host-remote`
1. Run `pnpm install`, `pnpm build` and `pnpm serve` . This will build and serve both `host` and `remote` on ports 5030, 5031 respectively:
    - HOST (rollup-host): [localhost:5030](http://localhost:5030/)
    - REMOTE (rollup-remote): [localhost:5031](http://localhost:5031/)

`CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.
