'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    // BASE_API: '"http://192.168.33.216:8800"',
    BASE_API: '"http://192.168.91.216:8800"'
})
