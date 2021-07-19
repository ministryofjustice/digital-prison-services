// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'express'.
const express = require('express')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'passport'.
const passport = require('passport')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'flash'.
const flash = require('connect-flash')
const tokenRefresherFactory = require('./tokenRefresher').factory
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'sessionMan... Remove this comment to see the full error message
const sessionManagementRoutes = require('./sessionManagementRoutes')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'auth'.
const auth = require('./auth')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'router'.
const router = express.Router()

module.exports = ({ oauthApi, tokenVerificationApi }) => {
  auth.init()
  const tokenRefresher = tokenRefresherFactory(oauthApi.refresh, config.app.tokenRefreshThresholdSeconds)

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  /* login, logout, token refresh etc */
  sessionManagementRoutes.configureRoutes({
    app: router,
    tokenRefresher,
    tokenVerifier: tokenVerificationApi.verifyToken,
    homeLink: config.app.url,
  })

  return router
}
