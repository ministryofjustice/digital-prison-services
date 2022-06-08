import passport from 'passport'
import querystring from 'querystring'
import logger from './log'
import contextProperties from './contextProperties'
import config from './config'

const isXHRRequest = (req) =>
  req.xhr ||
  (req.headers.accept && (req.headers.accept.indexOf('json') > -1 || req.headers.accept.indexOf('image/*') > -1)) ||
  (req.path && req.path.endsWith('.js'))

/**
 * Add session management related routes to an express 'app'.
 * These handle sign in, sign out, and middleware to handle the JWT token cookie. (hmppsCookie).
 * @param app an Express instance.
 * @param tokenRefresher a function which uses the 'context' object to perform an OAuth token refresh (returns a promise).
 * @param tokenVerifier a function which uses the 'context' object to check whether the token is valid (returns a promise).
 * @param homeLink The URL for the home page.
 */
export const configureRoutes = ({ app, tokenRefresher, tokenVerifier, homeLink }) => {
  const authSignOutUrl = `${config.apis.oauth2.ui_url}sign-out?client_id=${config.apis.oauth2.clientId}&redirect_uri=${config.app.url}`

  const remoteSignInIndex = (req, res, next) => {
    req.session.returnTo = req.query.returnTo
    return passport.authenticate('oauth2')(req, res, next)
  }

  const signOut = (req, res) => {
    req.session.destroy(() => {
      res.redirect(authSignOutUrl)
    })
  }

  /**
   * A client who sends valid OAuth tokens when visits the sign in page is redirected to the
   * react application at '/'
   * @param req
   * @param res
   * @param next
   */
  const signInMiddleware = (req, res, next) => {
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
      // need to sign out here otherwise user will still be considered authenticated when we take them to /sign-in
      req.logout(err => {
        if (err) return next(err)
      })

      if (isXHRRequest(req)) {
        req.session.destroy()
        res.status(401)
        res.json({ reason: 'session-expired' })
        next(error)
        return
      }

      req.session.destroy(() => {
        const query = querystring.stringify({ returnTo: req.originalUrl })
        res.redirect(`/sign-in?${query}`)
      })
    }
  }

  /**
   * If the user is not authenticated the client is denied access to the application and is redirected to the sign in page.
   * (or if this is a 'data' request then the response is an Http 401 status (Expired)
   */
  const requireSignInMiddleware = async (req, res, next) => {
    if (req.isAuthenticated() && (await tokenVerifier(req.user))) {
      contextProperties.setTokens(req.user, res.locals)
      next()
      return
    }
    req.logout(err => {
      if (err) return next(err)
    })
    // need logout as want session recreated from latest auth credentials
    if (isXHRRequest(req)) {
      req.session.destroy()
      res.status(401)
      res.json({ reason: 'session-expired' })
      return
    }

    req.session.destroy(() => {
      const query = querystring.stringify({ returnTo: req.originalUrl })
      res.redirect(`/sign-in?${query}`)
    })
  }

  app.get('/sign-in', signInMiddleware, remoteSignInIndex)

  app.get('/login/callback', (req, res) => {
    res.redirect('sign-in/callback')
  })

  app.get('/login', (req, res) => {
    res.redirect('/sign-in')
  })

  app.get('/sign-in/callback', (req, res, next) => {
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
      req.logIn(user, (err2) => {
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
    return res.render('autherror.njk', {
      homeLink,
    })
  })

  app.get('/auth/sign-out', signOut)
  app.get('/sign-out', (req, res) => {
    res.redirect('/auth/sign-out')
  })

  app.use(refreshTokenMiddleware)
  app.use(requireSignInMiddleware)

  /**
   * An end-point that does nothing.
   * Clients can periodically 'ping' this end-point to refresh the cookie 'session' and JWT token.
   * Must be installed after the middleware so that OAuth token refresh happens.
   */
  app.use('/heart-beat', (req, res) => {
    res.sendStatus(200)
  })
}

export default { configureRoutes }
