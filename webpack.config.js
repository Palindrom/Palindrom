var webpack = require('webpack');

module.exports = [
  {
    entry: './src/palindrom.js',
    output: {
      filename: 'dist/palindrom.js',
      library: 'Palindrom',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['.js']
    }
  },
  {
    entry: './src/palindrom.js',
    output: {
      filename: 'dist/palindrom.min.js',
      library: 'Palindrom',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['.js']
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  },
  {
    entry: './src/palindrom-dom.js',
    output: {
      filename: 'dist/palindrom-dom.js',
      library: 'PalindromDOM',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['.js']
    }
  },
  {
    entry: './src/palindrom-dom.js',
    output: {
      filename: 'dist/palindrom-dom.min.js',
      library: 'PalindromDOM',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['.js']
    },
    plugins: [
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  },
  /* bundle tests for browser */
  {
    entry: './test/runner.js',
    output: {
      filename: 'test/runner-browser.js',
      library: 'Tests',
      libraryTarget: 'var'
    },
    resolve: {
      extensions: ['.js']
    }
  },
];
