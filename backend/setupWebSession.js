const express = require('express')
const redis = require('redis')
const session = require('express-session')
const RedisStore = require('connect-redis')(session)

const config = require('./config')

const router = express.Router()

module.exports = () => {
  const getSessionStore = () => {
    const { host, port, password } = config.redis
    if (!host) return null

    const client = redis.createClient({
      host,
      port,
      password,
      tls: false,
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
      cookie: {
        name: config.hmppsCookie.name,
        domain: config.hmppsCookie.domain,
        httpOnly: true,
        maxAge: config.hmppsCookie.expiryMinutes * 60 * 1000,
        sameSite: 'strict',
        secure: config.app.production,
        signed: true,
      },
    })
  )
  return router
}
