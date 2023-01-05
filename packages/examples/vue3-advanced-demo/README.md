# Vue3 Advanced Module Federation Demo

This example demos consumption of federated modules from a vite bundle, which comes from  https://micro-frontends.org/ .

## Running Demo

1. ``` cd packages/examples/vue3-advanced-demo```

2. ```pnpm restart``` You can directly stop the 5001 - 5003 ports occupied by other applications, and compile and start the Host and Remote services

3. `CTRL + C` can only stop the host server. You can run `pnpm stop` to stop all services.

### Advanced Demo
We have added a Demo to show the combination of `Vite + Vue + Pinia + Vue Router + Element Plus`.

- HOST (team-red): [localhost:5001](http://localhost:5001/)
- REMOTE (team-blue): [localhost:5002](http://localhost:5002/)
- REMOTE (team-green): [localhost:5003](http://localhost:5003/)

Similarly, we can launch the Dev mode on the Host side for development.
- HOST (team-red): [localhost:5001](http://localhost:5001/)
```bash
cd packages/examples/vue3-advanced-demo/team-red
pnpm run dev
```
