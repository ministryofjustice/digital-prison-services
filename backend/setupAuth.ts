import express from 'express'
import passport from 'passport'
import flash from 'connect-flash'
import { factory as tokenRefresherFactory } from './tokenRefresher'
import sessionManagementRoutes from './sessionManagementRoutes'
import auth from './auth'
import config from './config'

const router = express.Router()

export default ({ oauthApi, tokenVerificationApi }) => {
  auth.init()
  const tokenRefresher = tokenRefresherFactory(oauthApi.refresh, config.app.tokenRefreshThresholdSeconds)

  router.use(passport.initialize())
  router.use(passport.session())
  router.use(flash())

  /* sign in, sign out, token refresh etc */
  sessionManagementRoutes.configureRoutes({
    app: router,
    tokenRefresher,
    tokenVerifier: tokenVerificationApi.verifyToken,
    homeLink: config.app.url,
  })

  return router
}
