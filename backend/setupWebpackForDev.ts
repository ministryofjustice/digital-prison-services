// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
const webpack = require('webpack')
const middleware = require('webpack-dev-middleware')
const hrm = require('webpack-hot-middleware')

const webpackConfig = require('../webpack.config')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

module.exports = () => {
  if (config.app.production === false && config.app.disableWebpack === false) {
    const compiler = webpack(webpackConfig)
    router.use('/app', middleware(compiler, { writeToDisk: true }))
    router.use('/app', hrm(compiler, {}))
  }

  return router
}
