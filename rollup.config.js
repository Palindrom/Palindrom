import { version } from "./package.json";
import { terser } from "rollup-plugin-terser";
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import nodeGlobals from 'rollup-plugin-node-globals';

// configure setup common for all bundles
const plugins = [
    terser({
        include: [/^.+\.min\.js$/],
        output: {
            comments: function(node, comment) {
                var text = comment.value;
                var type = comment.type;
                return /^!|@preserve|@license|@cc_on/i.test(text);
            }
        }
    }),
    commonjs(),
    nodeResolve({browser: true}),
    nodeGlobals()
];
// use native browser `fetch` and `WebSocket` instead of packages used in NodeJS
const globals = {
    'node-fetch': 'fetch',
    'websocket': 'WebSocket'
}
const external = ['websocket', 'node-fetch', 'module'];
// bundle for browser, export all named exports
const output = {
    format: 'iife',
    // name: 'Palindrom',
    // hack to export multiple named exports as globals
    name: 'window',
    extend: true,

    globals
}

// export actual bundles
export default [
    // Palindrom
    {
        input: './src/palindrom.js',
        external,
        output: [
            {
                ...output,
                file: 'dist/palindrom.js',
                banner: `/*! Palindrom, version: ${version} */`
            },
            {
                ...output,
                file: 'dist/palindrom.min.js',
                banner: `/*! Palindrom, version: ${version} */`
            }
        ],
        plugins
    }, 
    // Palindrom DOM
    {
        input: './src/palindrom-dom.js',
        external,
        output: [
            {
                ...output,
                file: 'dist/palindrom-dom.js',
                banner: `/*! PalindromDOM, version: ${version} */`
            },
            {
                ...output,
                file: 'dist/palindrom-dom.min.js',
                banner: `/*! PalindromDOM, version: ${version} */`
            }
        ],
        plugins
    },
    // Test suite
    {
        input: './test/runner.js',
        external,
        output: {
            file: 'test/runner-browser.js',
            format: 'iife',
            globals
        },
        plugins
    }
];