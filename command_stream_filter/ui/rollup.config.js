const resolve = require('@rollup/plugin-node-resolve')
//const commonjs = require('@rollup/plugin-commonjs')
//const terser = require('rollup-plugin-terser').terser
//const pkg = require('./package.json')

module.exports = [
    // ES6 Modules Non-minified
    {
        input: 'flatland.js',
        output: {
            file: 'flatland-build.js',
            format: 'esm',
        },
        plugins: [
            resolve.nodeResolve(),
        ],
    },
    // ES6 Modules Minified
	/*
    {
        input: 'lib/index.js',
        output: {
            file: pkg.browser.replace(/\.js$/, '.min.mjs'),
            format: 'esm',
        },
        plugins: [
            resolve.nodeResolve(),
            commonjs(),
            terser(),
        ],
    },
	*/
]