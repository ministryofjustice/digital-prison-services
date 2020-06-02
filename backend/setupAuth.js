const express = require('express')
const passport = require('passport')
const flash = require('connect-flash')
const tokenRefresherFactory = require('./tokenRefresher').factory
const sessionManagementRoutes = require('./sessionManagementRoutes')
const auth = require('./auth')
const config = require('./config')

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
    mailTo: config.app.mailTo,
    homeLink: config.app.notmEndpointUrl,
  })

  return router
}
