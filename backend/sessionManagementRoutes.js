const passport = require('passport')
const querystring = require('querystring')
const logger = require('./log')
const contextProperties = require('./contextProperties')
const config = require('./config')

const isXHRRequest = req =>
  req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1) || (req.path && req.path.endsWith('.js'))

/**
 * Add session management related routes to an express 'app'.
 * These handle login, logout, and middleware to handle the JWT token cookie. (hmppsCookie).
 * @param app an Express instance.
 * @param healthApi a configured healthApi instance.
 * @param tokenRefresher a function which uses the 'context' object to perform an OAuth token refresh (returns a promise).
 * @param mailTo The email address displayed at the bottom of the login page.
 * @param homeLink The URL for the home page.
 */
const configureRoutes = ({ app, healthApi, tokenRefresher, mailTo, homeLink }) => {
  const authLogoutUrl = config.app.remoteAuthStrategy
    ? `${config.apis.oauth2.ui_url}logout?client_id=${config.apis.oauth2.clientId}&redirect_uri=${
        config.app.notmEndpointUrl
      }`
    : `${config.app.notmEndpointUrl}login`

  const loginIndex = async (req, res) => {
    const isApiUp = await healthApi.isUp()
    logger.info(`loginIndex - health check called and isApiUp = ${isApiUp}`)
    const errors = req.flash('error')
    const authError = Boolean(errors && errors.length > 0)
    const authErrorText = (authError && errors[0]) || ''
    res.render('login', { authError, authErrorText, apiUp: isApiUp, mailTo, homeLink })
  }

  const remoteLoginIndex = (req, res, next) => {
    // eslint-disable-next-line no-param-reassign
    req.session.returnTo = req.query.returnTo
    return passport.authenticate('oauth2')(req, res, next)
  }

  const login = (req, res) =>
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login',
      failureFlash: true,
    })(req, res)

  const logout = (req, res) => {
    req.logout()
    // eslint-disable-next-line no-param-reassign
    req.session = null
    res.redirect(authLogoutUrl)
  }

  /**
   * A client who sends valid OAuth tokens when visits the login page is redirected to the
   * react application at '/'
   * @param req
   * @param res
   * @param next
   */
  const loginMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
      res.redirect('/')
      return
    }
    next()
  }

  /**
   * Check that the authenticated user has a valid token and if not then attempt to refresh it
   */
  const refreshTokenMiddleware = async (req, res, next) => {
    try {
      if (req.isAuthenticated()) {
        await tokenRefresher(req.user)
      }
      next()
    } catch (error) {
      // need to logout here otherwise user will still be considered authenticated when we take them to /login
      req.logout()

      if (isXHRRequest(req)) {
        res.status(401)
        res.json({ reason: 'session-expired' })
        next(error)
        return
      }

      const query = querystring.stringify({ returnTo: req.originalUrl })
      res.redirect(`/login?${query}`)
    }
  }

  /**
   * If the user is not authenticated the client is denied access to the application and is redirected to the login page.
   * (or if this is a 'data' request then the response is an Http 401 status (Expired)
   */
  const requireLoginMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
      contextProperties.setTokens(req.user, res.locals)
      next()
      return
    }
    if (isXHRRequest(req)) {
      res.status(401)
      res.json({ reason: 'session-expired' })
      return
    }

    const query = querystring.stringify({ returnTo: req.originalUrl })
    res.redirect(`/login?${query}`)
  }

  app.get('/login', loginMiddleware, config.app.remoteAuthStrategy ? remoteLoginIndex : loginIndex)
  if (!config.app.remoteAuthStrategy) app.post('/login', login)

  app.get('/login/callback', (req, res, next) => {
    passport.authenticate('oauth2', (err, user, info) => {
      if (err) {
        return res.redirect('/autherror')
      }
      if (!user) {
        if (info && info.message === 'Unable to verify authorization request state.') {
          // failure to due authorisation state not being there on return, so retry
          logger.info('Retrying auth callback as no state found')
          return res.redirect('/')
        }
        logger.info(`Auth failure due to ${JSON.stringify(info)}`)
        return res.redirect('/autherror')
      }
      req.logIn(user, err2 => {
        if (err2) {
          return next(err2)
        }
        const { returnTo } = req.session
        if (typeof returnTo === 'string' && returnTo.startsWith('/')) {
          return res.redirect(returnTo)
        }
        return res.redirect('/')
      })
      return null
    })(req, res, next)
  })

  app.get('/autherror', (req, res) => {
    res.status(401)
    return res.render('pages/autherror', {
      authURL: authLogoutUrl,
      mailTo,
      homeLink,
    })
  })

  app.get('/auth/logout', logout)
  app.get('/logout', (req, res) => {
    res.redirect('/auth/logout')
  })

  app.use(refreshTokenMiddleware)
  app.use(requireLoginMiddleware)

  /**
   * An end-point that does nothing.
   * Clients can periodically 'ping' this end-point to refresh the cookie 'session' and JWT token.
   * Must be installed after the middleware so that OAuth token refresh happens.
   */
  app.use('/heart-beat', (req, res) => {
    res.sendStatus(200)
  })
}

module.exports = { configureRoutes }
