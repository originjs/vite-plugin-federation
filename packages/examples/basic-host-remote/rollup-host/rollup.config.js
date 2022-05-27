import federation from "@dilesoft/vite-plugin-federation-dynamic";

import pkg from "./package.json";

export default {
  input: "src/index.js",
  preserveEntrySignatures: false,
  plugins: [
    federation({
      remotes: {
        remote_app: "http://localhost:5001/remoteEntry.js",
      }
    }),
  ],
  output: [{ format: "esm", dir: pkg.main }],
};
