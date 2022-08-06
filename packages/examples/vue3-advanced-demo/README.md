# Vue3 Advanced Module Federation Demo

This example demos consumption of federated modules from a vite bundle. `router-host` app depends on components exposed by `router-remote` and itself.

## Running Demo

1. ``` cd packages/examples/vue3-advanced-demo```

2. ```pnpm restart``` You can directly stop the 5004 and 5005 ports occupied by other applications, and compile and start the Host and Remote services

3. `CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.

### Advanced Demo
We have added a Demo to show the combination of `Vite + Vue + Vuex + Vue Router + Element Plus + ECharts`.
We ported part of the Vuex example from [vuex's official example](https://github.com/vuejs/vuex/tree/4.0/examples/classic/shopping-cart) as a functional verification.

- HOST (router-host): [localhost:5004](http://localhost:5004/)
- REMOTE (router-remote): [localhost:5005](http://localhost:5005/)

Similarly, we can launch the Dev mode on the Host side for development.
- HOST (router-host): [localhost:5104](http://localhost:5104/)
```bash
cd packages/examples/vue3-advanced-demo/router-host
yarn dev
```

### Preview
![image-20211210105354887](README-Preview-Image)
