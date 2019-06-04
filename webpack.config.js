const webpack = require('webpack');
const version = require('./package.json').version;
const nodeExternals = require('webpack-node-externals');

module.exports = [
    {
        entry: './src/palindrom.js',
        output: {
            filename: 'palindrom.js',
            libraryExport: 'default',
            library: 'Palindrom',
            libraryTarget: 'var'
        },
        mode: 'production',
        optimization: {
            // We no not want to minimize our code for node
            minimize: false
        },
        resolve: {
            extensions: ['.js']
        },
        /* (see: https://webpack.js.org/configuration/externals/) */
        externals: {
            websocket: 'WebSocket',
            './URLShim': 'URL',
            'node-fetch': 'null'
        },
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    {
        entry: './src/palindrom.js',
        output: {
            filename: 'palindrom.min.js',
            libraryExport: 'default',
            library: 'Palindrom',
            libraryTarget: 'var'
        },
        mode: 'production',
        resolve: {
            extensions: ['.js']
        },
        externals: {
            websocket: 'WebSocket',
            './URLShim': 'URL',
            'node-fetch': 'null'
        },
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    {
        entry: './src/palindrom.js',
        output: {
            filename: 'palindrom.node.js',
            library: 'Palindrom',
            libraryTarget: 'commonjs-module',
            libraryExport: 'default'
        },
        mode: 'production',
        optimization: {
            // We no not want to minimize our code for node
            minimize: false
        },
        resolve: {
            extensions: ['.js']
        },
        target: 'node',
        externals: [nodeExternals()],
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    {
        entry: './src/palindrom-dom.js',
        output: {
            filename: 'palindrom-dom.js',
            libraryExport: 'default',
            library: 'PalindromDOM',
            libraryTarget: 'var'
        },
        resolve: {
            extensions: ['.js']
        },
        mode: 'production',
        optimization: {
            // We no not want to minimize our code for node
            minimize: false
        },
        externals: {
            websocket: 'WebSocket',
            './URLShim': 'URL',
            'node-fetch': 'null'
        },
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    {
        entry: './src/palindrom-dom.js',
        output: {
            filename: 'palindrom-dom.min.js',
            libraryExport: 'default',
            library: 'PalindromDOM',
            libraryTarget: 'var'
        },
        mode: 'production',
        resolve: {
            extensions: ['.js']
        },
        externals: {
            websocket: 'WebSocket',
            './URLShim': 'URL',
            'node-fetch': 'null'
        },
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    /* bundle tests for browser */
    {
        entry: './test/runner.js',
        output: {
            filename: '../test/runner-browser.js',
            library: 'Tests',
            libraryTarget: 'var'
        },
        mode: 'development',
        externals: {
            websocket: 'window.MockWebSocket',
            './URLShim': 'URL',
            'node-fetch': 'null'
        },
        resolve: {
            extensions: ['.js']
        }
    },
    /* bundle tests for node */
    {
        entry: './test/runner.js',
        output: {
            filename: '../test/runner-node.js',
            library: 'Tests',
            libraryTarget: 'commonjs'
        },
        mode: 'development',
        target: 'node',
        resolve: {
            extensions: ['.js'],
            alias: { websocket: '../test/inject-mock-websocket.js' }
        }
    }
];
