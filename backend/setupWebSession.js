const express = require('express')
const cookieSession = require('cookie-session')
const config = require('./config')

const router = express.Router()

module.exports = () => {
  router.use(
    cookieSession({
      name: config.hmppsCookie.name,
      domain: config.hmppsCookie.domain,
      maxAge: config.hmppsCookie.expiryMinutes * 60 * 1000,
      secure: config.app.production,
      httpOnly: true,
      signed: true,
      keys: [config.hmppsCookie.sessionSecret],
      overwrite: true,
      sameSite: 'lax',
    })
  )

  // Ensure cookie session is extended (once per minute) when user interacts with the server
  router.use((req, res, next) => {
    // eslint-disable-next-line no-param-reassign
    req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
    next()
  })

  return router
}
