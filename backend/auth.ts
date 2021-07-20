// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'passport'.
const passport = require('passport')
const OAuth2Strategy = require('passport-oauth2').Strategy
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'apiClientC... Remove this comment to see the full error message
const { apiClientCredentials } = require('./api/oauthApi')
// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'config'.
const config = require('./config')

passport.serializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

passport.deserializeUser((user, done) => {
  // Not used but required for Passport
  done(null, user)
})

const init = () => {
  passport.use(
    new OAuth2Strategy(
      {
        authorizationURL: `${config.apis.oauth2.ui_url}oauth/authorize`,
        tokenURL: `${config.apis.oauth2.url}oauth/token`,
        clientID: config.apis.oauth2.clientId,
        clientSecret: config.apis.oauth2.clientSecret,
        callbackURL: `${config.app.url}login/callback`,
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

module.exports.init = init
