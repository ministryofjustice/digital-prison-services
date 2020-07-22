const express = require('express')
const bunyanMiddleware = require('bunyan-middleware')
const hsts = require('hsts')
const helmet = require('helmet')
const noCache = require('nocache')
const config = require('./config')
const log = require('./log')
const ensureHttps = require('./middleware/ensureHttps')

const sixtyDaysInSeconds = 5184000

const router = express.Router()

module.exports = () => {
  router.use(helmet())

  router.use(
    hsts({
      maxAge: sixtyDaysInSeconds,
      includeSubDomains: true,
      preload: true,
    })
  )
  router.use(
    bunyanMiddleware({
      logger: log,
      obscureHeaders: ['Authorization'],
    })
  )

  if (config.app.production) {
    router.use(ensureHttps)
  }

  // Don't cache dynamic resources
  router.use(noCache())

  return router
}
