import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import federation from '@originjs/vite-plugin-federation'
import pkg from './package.json' assert { type: 'json' }
import replace from '@rollup/plugin-replace'

export default {
  input: {

    index: 'src/index.js',
  },
  plugins: [
    resolve(),
    babel(),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    federation({
      remotes: {
        remote_app: {
          external: 'http://localhost:5001/remoteEntry.js',
          from: 'webpack'
        }
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: pkg.dependencies.react,
          version: '16.14.0',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: pkg.dependencies['react-dom'],
          version: '16.14.0'
        }
      }
    })
  ],
  output: {
    format: 'system',
    dir: pkg.main,
  },
}
