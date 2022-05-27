import federation from '@dilesoft/vite-plugin-federation-dynamic';

export default {
  input: "src/index.js",
  plugins: [
    federation({
      filename: "remoteEntry.js",
      exposes: {
        "./Button": "./src/button"
      }
    }),
  ],
  output: {
    format: "esm",
    dir: "dist"
  },
};
