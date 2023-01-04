import babel from '@rollup/plugin-babel'
import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import federation from '@originjs/vite-plugin-federation'
import replace from '@rollup/plugin-replace'
import pkg from './package.json' assert { type: 'json' }

export default {
  input: 'src/index.js',
  plugins: [
    resolve(),
    babel({ babelHelpers: 'bundled',extensions: ['.js', '.ts', '.jsx', '.tsx'] }),
    commonjs(),
    replace({
      'process.env.NODE_ENV': JSON.stringify('production'),
      preventAssignment: true
    }),
    federation({
      filename: 'remoteEntry.js',
      exposes: {
        './Button': './src/button.jsx',
        './Button1': './src/button1.jsx'
      },
      shared: [
        {
          react: {
            requiredVersion: '^1.0.0',
          },
          'react-dom': {
            requiredVersion: pkg.dependencies['react-dom'],
            import:false
          }
        }
      ]
    })
  ],
  output: {
    format: 'systemjs',
    dir: pkg.main,
    minifyInternalExports: true
  }
}
