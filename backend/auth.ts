import passport from 'passport'
import { Strategy as OAuth2Strategy } from 'passport-oauth2'
import { apiClientCredentials } from './api/oauthApi'
import config from './config'

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

export const init = () => {
  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: `${config.apis.oauth2.ui_url}oauth/authorize`,
        tokenURL: `${config.apis.oauth2.url}oauth/token`,
        clientID: config.apis.oauth2.clientId,
        clientSecret: config.apis.oauth2.clientSecret,
        callbackURL: `${config.app.url}sign-in/callback`,
        state: true,
        customHeaders: {
          Authorization: `Basic ${apiClientCredentials(config.apis.oauth2.clientId, config.apis.oauth2.clientSecret)}`,
        },
      },
      (accessToken, refreshToken, params, profile, done) =>
        done(null, { access_token: accessToken, refresh_token: refreshToken, authSource: params.auth_source })
    )
  )
}

export default {
  init,
}
