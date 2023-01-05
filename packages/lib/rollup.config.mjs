import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'

import pkg from './package.json' assert { type: "json" }

export default [
  {
    input: 'src/utils/semver/index.ts',
    plugins: [typescript({ include: './src/**/*.ts', module: 'esnext' })],
    external: ['path'],
    output: [{ format: 'esm', file: 'dist/satisfy.js' }]
  },
  {
    input: 'src/index.ts',
    plugins: [
      resolve(),
      typescript({ include: './src/**/*.ts', module: 'esnext' })
    ],
    external: ['path'],
    output: [
      { format: 'cjs', file: pkg.main, exports: 'auto' },
      { format: 'esm', file: pkg.module }
    ]
  }
]
