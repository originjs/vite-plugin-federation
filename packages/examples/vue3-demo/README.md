# VueJs Module Federation Demo

This example demos consumption of federated modules from a rollup bundle. `layout` app depends on a component exposed by `home` app.

---

# Running Demo

Run `yarn start` . This will build and serve `common-lib`, `home` and `layout` on ports 5002, 5001 and 5000 respectively.

- HOST (layout): [localhost:5000](http://localhost:5000/)
- REMOTE (home): [localhost:5001](http://localhost:5001/)
- REMOTE (common-lib): [localhost:5002](http://localhost:5002/)
