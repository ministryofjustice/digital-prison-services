// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
const redis = require('redis')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'session'.
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

module.exports = () => {
  const getSessionStore = () => {
    const { enabled, host, port, password } = config.redis
    if (!enabled || !host) return null

    const client = redis.createClient({
      host,
      port,
      password,
      tls: config.app.production ? {} : false,
    })

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
