const path = require("path");
const {VueLoaderPlugin} = require("vue-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const {ModuleFederationPlugin} = require("webpack").container;
module.exports = (env = {}) => ({
  mode: "development",
  cache: false,
  target: 'es2020',
  devtool: false,
  entry: path.resolve(__dirname, "./src/main.js"),
  // output: {
  //   path: path.resolve(__dirname, './dist'),
  //   publicPath: '/dist/'
  // },
  experiments: {
    outputModule: true
  },
  output: {
    // library: {type: 'module'},
    publicPath: 'auto'
  },
  resolve: {
    extensions: [".vue", ".jsx", ".js", ".json"],
    alias: {
      // this isn't technically needed, since the default `vue` entry for bundlers
      // is a simple `export * from '@vue/runtime-dom`. However having this
      // extra re-export somehow causes webpack to always invalidate the module
      // on the first HMR update and causes the page to reload.
      // vue: "@vue/runtime-dom",
    },
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: "vue-loader",
      },
      {
        test: /\.png$/,
        use: {
          loader: "url-loader",
          options: {limit: 8192},
        },
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          "css-loader",
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    }),
    new ModuleFederationPlugin({
      name: "home",
      filename: "remoteEntry.js",
      library: {type: 'module'},
      exposes: {
        "./Content": "./src/components/Content",
        "./Button": "./src/components/Button",
      },
      remotes: {
        layout: "http://localhost:5000/assets/remoteEntry.js",
      },
      // remoteType:'module',
      shared: {
        vue: {
          // singleton: true,
          // import: false,
          requiredVersion: '^3.0.0'
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: "./index.ejs",
      inject: false
    }),
    new VueLoaderPlugin(),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname),
    },
    compress: true,
    port: 5001,
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
  },
});
