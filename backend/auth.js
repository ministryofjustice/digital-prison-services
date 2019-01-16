const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const OAuth2Strategy = require('passport-oauth2').Strategy
const { AuthClientErrorName, apiClientCredentials } = require('./api/oauthApi')
const config = require('./config')

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

const init = oauthApi => {
  passport.use(
    config.app.remoteAuthStrategy
      ? new OAuth2Strategy(
          {
            authorizationURL: `${config.apis.oauth2.ui_url}oauth/authorize`,
            tokenURL: `${config.apis.oauth2.url}oauth/token`,
            clientID: config.apis.oauth2.clientId,
            clientSecret: config.apis.oauth2.clientSecret,
            callbackURL: `${config.app.url}/login/callback`,
            state: true,
            sessionKey: 'oauth2',
            customHeaders: {
              Authorization: `Basic ${apiClientCredentials(
                config.apis.oauth2.clientId,
                config.apis.oauth2.clientSecret
              )}`,
            },
          },
          (accessToken, refreshToken, profile, done) =>
            done(null, { access_token: accessToken, refresh_token: refreshToken })
        )
      : new LocalStrategy(async (username, password, done) => {
          try {
            const user = await oauthApi.authenticate(username, password)
            return done(null, user)
          } catch (error) {
            const message =
              error.name === AuthClientErrorName ? error.message : 'A system error occurred; please try again later'
            return done(null, false, { message })
          }
        })
  )
}

module.exports.init = init
