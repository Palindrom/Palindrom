const webpack = require('webpack');
const version = require('./package.json').version;
const nodeExternals = require('webpack-node-externals');

module.exports = [
    {
        entry: './src/palindrom.js',
        output: {
            filename: 'palindrom.js',
            libraryExport: 'Palindrom',
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
            'node-fetch': 'null'
        },
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    {
        entry: './src/palindrom.js',
        output: {
            filename: 'palindrom.min.js',
            libraryExport: 'Palindrom',
            library: 'Palindrom',
            libraryTarget: 'var'
        },
        mode: 'production',
        resolve: {
            extensions: ['.js']
        },
        externals: {
            websocket: 'WebSocket',
            'node-fetch': 'null'
        },
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    {
        entry: './src/palindrom-dom.js',
        output: {
            filename: 'palindrom-dom.js',
            libraryExport: 'PalindromDOM',
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
            'node-fetch': 'null'
        },
        plugins: [new webpack.BannerPlugin('Palindrom, version: ' + version)]
    },
    {
        entry: './src/palindrom-dom.js',
        output: {
            filename: 'palindrom-dom.min.js',
            libraryExport: 'PalindromDOM',
            library: 'PalindromDOM',
            libraryTarget: 'var'
        },
        mode: 'production',
        resolve: {
            extensions: ['.js']
        },
        externals: {
            websocket: 'WebSocket',
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
        optimization: {
            // We no not want to minimize our code for testing
            minimize: false
        },
        externals: {
            websocket: 'window.MockWebSocket',
            'node-fetch': 'null'
        },
        resolve: {
            extensions: ['.js']
        },
        devtool: "source-map"
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
