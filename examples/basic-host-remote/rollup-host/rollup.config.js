import federation from "@module-federation/rollup-federation";

import pkg from "./package.json";

export default {
  input: "src/index.js",
  preserveEntrySignatures: false,
  plugins: [
    federation({
      remotes: {
        remote_app: "http://localhost:8081/remoteEntry.js",
      }
    }),
  ],
  output: [{ format: "esm", dir: pkg.main }],
};
