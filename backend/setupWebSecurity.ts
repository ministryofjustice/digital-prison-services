import express from 'express'
import helmet from 'helmet'
import config from './config'
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

  if (config.app.production) {
    router.use(ensureHttps)
  }

  return router
}
