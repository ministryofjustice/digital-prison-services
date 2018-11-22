const logger = require('./log')
const { AuthClientErrorName } = require('./api/oauthApi')
const contextProperties = require('./contextProperties')

const LOGIN_PATH = '/auth/login'
const LOGOUT_PATH = '/auth/logout'
/**
 * Add session management related routes to an express 'app'.
 * These handle login, logout, and middleware to handle the JWT token cookie. (hmppsCookie).
 * @param app an Express instance.
 * @param healthApi a configured healthApi instance.
 * @param oauthApi (authenticate, refresh)
 * @param tokenRefresher a function which uses the 'context' object to perform an OAuth token refresh (returns a promise).
 * @param mailTo The email address displayed at the bottom of the login page.
 * @param homeLink The URL for the home page.
 */
const configureRoutes = ({ app, healthApi, oauthApi, tokenRefresher, mailTo, homeLink }) => {
  const loginIndex = async (req, res) => {
    const isApiUp = await healthApi.isUp()
    logger.info(`loginIndex - health check called and the isaAppUp = ${isApiUp}`)
    res.render('login', { authError: false, apiUp: isApiUp, mailTo, homeLink })
  }

  const login = async (req, res) => {
    const { username, password } = req.body

    try {
      await oauthApi.authenticate(req.session, username, password)

      res.redirect('/')
    } catch (error) {
      if (error.name === AuthClientErrorName) {
        res.status(401)
        res.render('login', {
          authError: true,
          authErrorText: error.message,
          apiUp: true,
          mailTo,
          homeLink,
        })
      } else {
        res.status(503)
        logger.error(error)
        res.render('login', { authError: false, apiUp: false, mailTo, homeLink })
      }
    }
  }

  const logout = (req, res) => {
    // eslint-disable-next-line no-param-reassign
    req.session = null
    res.redirect(`${process.env.NN_ENDPOINT_URL}${LOGIN_PATH}`)
  }

  /**
   * A client who sends valid OAuth tokens when visits the login page is redirected to the
   * react application at '/'
   * @param req
   * @param res
   * @param next
   */
  const loginMiddleware = (req, res, next) => {
    if (contextProperties.hasTokens(req.session)) {
      // implies authenticated
      res.redirect('/')
      return
    }
    next()
  }

  const hmppsCookieMiddleware = async (req, res, next) => {
    try {
      if (contextProperties.hasTokens(req.session)) {
        await tokenRefresher(req.session)
      }
      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * If the context does not contain an accessToken the client is denied access to the
   * application and is redirected to the login page.
   * (or if this is a 'data' request then the response is an Http 404 status (Not Found)
   * @param req
   * @param res
   * @param next
   */
  const requireLoginMiddleware = (req, res, next) => {
    if (contextProperties.hasTokens(req.session)) {
      contextProperties.setTokens(req.session, res.locals)
      next()
      return
    }
    const isXHRRequest = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1)

    if (isXHRRequest) {
      res.status(401)
      res.json({ message: 'Session expired, please logout.', reason: 'session-expired' })
      return
    }

    res.redirect(LOGIN_PATH)
  }

  app.get(LOGIN_PATH, loginMiddleware, loginIndex)
  app.post(LOGIN_PATH, login)
  app.get(LOGOUT_PATH, logout)

  app.use(hmppsCookieMiddleware)
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
