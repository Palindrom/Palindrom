const webpack = require("webpack");
const MinifyPlugin = require('babel-minify-webpack-plugin');
const version = require('./package.json').version;

module.exports = [
  {
    entry: "./src/palindrom.js",
    output: {
      filename: "dist/palindrom.js",
      library: "Palindrom",
      libraryTarget: "var"
    },
    resolve: {
      extensions: [".js"]
    },
    /* (see: https://webpack.js.org/configuration/externals/) */
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]    
  },
  {
    entry: "./src/palindrom.js",
    output: {
      filename: "dist/palindrom.min.js",
      library: "Palindrom",
      libraryTarget: "var"
    },
    resolve: {
      extensions: [".js"]
    },
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new MinifyPlugin(), new webpack.BannerPlugin('Palindrom, version: ' + version)]
  },
  {
    entry: "./src/palindrom-dom.js",
    output: {
      filename: "dist/palindrom-dom.js",
      library: "PalindromDOM",
      libraryTarget: "var"
    },
    resolve: {
      extensions: [".js"]
    },
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
  },
  {
    entry: "./src/palindrom-dom.js",
    output: {
      filename: "dist/palindrom-dom.min.js",
      library: "PalindromDOM",
      libraryTarget: "var"
    },
    resolve: {
      extensions: [".js"]
    },
    externals: { websocket: "WebSocket", './URL': 'URL' },
    plugins: [new MinifyPlugin(), new webpack.BannerPlugin('Palindrom, version: ' + version)]
  },
  /* bundle tests for browser */
  {
    entry: "./test/runner.js",
    output: {
      filename: "test/runner-browser.js",
      library: "Tests",
      libraryTarget: "var"
    },
    externals: { websocket: "WebSocket", './URL': 'URL' },
    resolve: {
      extensions: [".js"]
    },
    plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
  }
];
