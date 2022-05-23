import express from 'express'
import { createClient } from 'redis'
import session from 'express-session'
import logger from './log'

import config from './config'

const RedisStore = require('connect-redis')(session)

const router = express.Router()

export default () => {
  const getSessionStore = () => {
    const { enabled, host, port, password } = config.redis
    if (!enabled || !host) return null

    const client = createClient({
      host,
      port,
      password,
      tls: config.app.production ? {} : false,
    })

    client.on('error', (e: Error) => logger.error(e, 'Redis client error'))

    return new RedisStore({ client })
  }

  router.use(
    session({
      store: getSessionStore(),
      secret: [config.hmppsCookie.sessionSecret],
      resave: false,
      saveUninitialized: false,
      rolling: true,
      name: config.hmppsCookie.name,
      cookie: {
        domain: config.hmppsCookie.domain,
        httpOnly: true,
        maxAge: config.hmppsCookie.expiryMinutes * 60 * 1000,
        sameSite: 'lax',
        secure: config.app.production,
        signed: true,
      },
    })
  )
  return router
}
