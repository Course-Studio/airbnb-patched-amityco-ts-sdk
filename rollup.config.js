import chalk from 'chalk';
import commonjs from '@rollup/plugin-commonjs';
import dotenv from 'rollup-plugin-dotenv';
import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import babel from '@rollup/plugin-babel';

import pkg from './package.json';

const config = {
  input: 'src/index.ts',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      builtins: false,
      browser: true,
    }),
    commonjs(),
    typescript({
      useTsconfigDeclarationDir: true,
    }),
    dotenv(),
  ],
  onwarn: warning => {
    // we don't allow circular dependencies other than those that we can not fix such as node_modules
    if (warning.code === 'CIRCULAR_DEPENDENCY' && !warning.importer.includes('node_modules')) {
      console.log(chalk.red('error'), warning.message);
      process.exit(1);
    }
  },
};

export default [
  {
    ...config,
    output: [
      {
        format: 'es',
        file: pkg.module,
      },
    ],
    external: Object.keys(pkg.dependencies),
    plugins: [
      ...config.plugins,
      replace({
        'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        'process.env.VERSION': `'v${pkg.version}-esm'`,
      }),
    ],
  },
  {
    ...config,
    output: [
      {
        format: 'cjs',
        file: pkg.main,
      },
    ],
    external: Object.keys(pkg.dependencies),
    plugins: [
      ...config.plugins,
      babel({ presets: ['@babel/preset-env'], babelHelpers: 'bundled' }),
      replace({
        'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        'process.env.VERSION': `'v${pkg.version}-cjs'`,
      }),
    ],
  },
  {
    ...config,
    output: {
      format: 'iife',
      name: 'Amity',
      file: pkg.unpkg,
    },
    plugins: [
      ...config.plugins,
      replace({
        'process.env.NODE_ENV': `'${process.env.NODE_ENV}'`,
        'process.env.VERSION': `'v${pkg.version}-umd'`,
      }),
      terser(),
    ],
  },
];
