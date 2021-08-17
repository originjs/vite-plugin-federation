# VueJs Module Federation Demo

This example demos consumption of federated modules from a rollup bundle. `layout` app depends on a component exposed by `home` app.

---

# Running Demo

Run `yarn start` . This will build and serve both `home` and `layout` on ports 3002 and 3001 respectively.

- HOST (layout): [localhost:5000](http://localhost:5000/)
- REMOTE (home): [localhost:5001](http://localhost:5001/)
