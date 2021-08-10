import express from 'express'
import bunyanMiddleware from 'bunyan-middleware'
import helmet from 'helmet'
import noCache from 'nocache'
import config from './config'
import log from './log'
import ensureHttps from './middleware/ensureHttps'

const sixtyDaysInSeconds = 5184000

const router = express.Router()

export default () => {
  router.use(
    helmet({
      contentSecurityPolicy: false,
      hsts: {
        maxAge: sixtyDaysInSeconds,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
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
