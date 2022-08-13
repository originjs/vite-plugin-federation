const path = require('path');
const { ModuleFederationPlugin } = require('webpack').container;
const HtmlWebpackPlugin = require("html-webpack-plugin");


/** @type {import('webpack').Configuration} */
module.exports = {
  entry: './src/index',
  mode: 'production',
  target: 'web',
  devtool: false,
  output: {
    libraryTarget: 'system',
    libraryExport: 'main',
    publicPath: 'http://localhost:5001/'
  },
  optimization: {
    // minimize: true,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react']
        }
      }
    ]
  },
  // externals: ["react", "react-dom"],
  plugins: [
    new ModuleFederationPlugin({
      name: 'rwebpackremote',
      library: { type: 'system' },
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/Button'
      },
      shared: {
        react: {
          // eager: true,
          // singleton: true,
          requiredVersion: '^16.12.0'
        },
        'react-dom': {
          // eager: true,
          // singleton: true,
          requiredVersion: '^16.12.0'
        }
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "./index.html"),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname)
    },
    port: 5001,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization'
    }
  }
}
