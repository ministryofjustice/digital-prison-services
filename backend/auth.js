const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { AuthClientErrorName } = require('./api/oauthApi')

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
    new LocalStrategy(async (username, password, done) => {
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
