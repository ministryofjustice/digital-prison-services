import express from 'express'
import webpack, { Configuration } from 'webpack'
import middleware from 'webpack-dev-middleware'
import hrm from 'webpack-hot-middleware'
import webpackConfig from '../webpack.config'
import config from './config'

const router = express.Router()

export default () => {
  if (config.app.production === false && config.app.disableWebpack === false) {
    const compiler = webpack(webpackConfig as Configuration)
    router.use('/app', middleware(compiler, { writeToDisk: true }))
    router.use('/app', hrm(compiler, {}))
  }

  return router
}
