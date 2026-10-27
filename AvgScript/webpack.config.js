//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack');

const copyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');
// const imageMinimizerPlugin = require("image-minimizer-webpack-plugin");

/**@type {import('webpack').Configuration}*/
const config = {
  performance: {
    hints: 'warning',
    maxEntrypointSize: 1024000,
    maxAssetSize: 1024000
  },
  optimization: {
    // minimizer: [
    //   new imageMinimizerPlugin({
    //     minimizer: {
    //       implementation: imageMinimizerPlugin.imageminMinify,
    //       options: {
    //         // Lossless optimization with custom option
    //         // Feel free to experiment with options for better result for you
    //         plugins: [
    //           ["jpegtran", { progressive: true }],
    //           ["optipng", { optimizationLevel: 5 }],
    //         ],
    //       },
    //     },
    //   }),
    // ],
  },

  target: 'webworker', // vscode extensions run in webworker context for VS Code web 📖 -> https://webpack.js.org/configuration/target/#target

  entry: './src/extension.ts', // the entry point of this extension, 📖 -> https://webpack.js.org/configuration/entry-context/
  output: {
    // the bundle is stored in the 'dist' folder (check package.json), 📖 -> https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode' // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
  },
  resolve: {
    // support reading TypeScript and JavaScript files, 📖 -> https://github.com/TypeStrong/ts-loader
    mainFields: ['browser', 'module', 'main'], // look for `browser` entry point in imported node modules
    extensions: ['.ts', '.js'],
    alias: {
      // provides alternate implementation for node module and source files
    },
    fallback: {
      // Webpack 5 no longer polyfills Node.js core modules automatically.
      // see https://webpack.js.org/configuration/resolve/#resolvefallback
      // for the list of Node.js core module polyfills.

      // to fix Can't resolve 'fs' and filePath.endsWith is not a function
      "fs": false,    
      "os": false,
      "path": false,
      "stream": false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "child_process": false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              // Let webpack resolve ESM dependencies while retaining import = require syntax.
              compilerOptions: { module: 'preserve', moduleResolution: 'node' }
            }
          }
        ]
      },
      // {
      //   test: /\.(jpe?g|png)$/i,
      //   type: "asset",
      // },
    ]
  },
  // https://stackoverflow.com/questions/56222368/webpack-config-how-to-change-plugins-depending-on-environment
  plugins: []
};

module.exports = (_env, argv = {}) => {
  if (argv.mode === 'production') {
    config.plugins?.push(new copyWebpackPlugin({
      patterns: [
        {
          from: "./../Document/media",
          to: "./../document/media"
        },
        {
          from: "./../Document/Hibiscus AVG Engine V6.0.md",
          to: "./../document/Hibiscus AVG Engine V6.0.md"
        }
      ]
    }));
    config.plugins?.push({
      apply(compiler) {
        const cleanOutput = () => {
          for (const directory of ['./dist', './document']) {
            fs.rmSync(path.resolve(directory), { recursive: true, force: true });
          }
        };
        compiler.hooks.beforeRun.tap('CleanOutput', cleanOutput);
      }
    });
  }

  return config;
};
