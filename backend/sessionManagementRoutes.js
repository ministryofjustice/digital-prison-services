const logger = require('./log');
const errorStatusCode = require('./error-status-code');

const contextProperties = require('./contextProperties');


const LOGIN_PATH = '/auth/login';
const LOGOUT_PATH = '/auth/logout';
/**
 * Add session management related routes to an express 'app'.
 * These handle login, logout, and middleware to handle the JWT token cookie. (hmppsCookie).
 * @param app an Express instance.
 * @param healthApi a configured healthApi instance.
 * @param oauthApi (authenticate, refresh)
 * @param hmppsCookieOperations (setCookie, extractCookieValues, clearCookie)
 * @param tokenRefresher a function which uses the 'context' object to perform an OAuth token refresh (returns a promise).
 * @param mailTo The email address displayed at the bottom of the login page.
 * @param homeLink The URL for the home page.
 */
const configureRoutes = ({ app, healthApi, oauthApi, hmppsCookieOperations, tokenRefresher, mailTo, homeLink }) => {
  const loginIndex = async (req, res) => {
    const isApiUp = await healthApi.isUp();
    logger.info(`loginIndex - health check called and the isaAppUp = ${isApiUp}`);
    res.render('login', { authError: false, apiUp: isApiUp, mailTo, homeLink });
  };

  const login = async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
      await oauthApi.authenticate(res.locals, username, password);

      hmppsCookieOperations.setCookie(res, res.locals);

      res.redirect('/');
    } catch (error) {
      const code = errorStatusCode(error);
      res.status(code);
      logger.error(error);
      if (code < 500) {
        logger.warn('Login failed for', { user: String(username) });
        res.render('login', { authError: true, authErrorText: getAuthErrorDescription(error), apiUp: true, mailTo, homeLink });
      } else {
        logger.error(error);
        res.render('login', { authError: false, apiUp: false, mailTo, homeLink });
      }
    }
  };

  function getAuthErrorDescription (error) {
    logger.info(`login error description = ${error.response && error.response.data && error.response.data.error_description}`);
    let type = 'The username or password you have entered is invalid.';
    if (error.response && error.response.data && error.response.data.error_description) {
      if (error.response.data.error_description.includes('ORA-28000')) {
        type = 'Your user account is locked.';
      } else if (error.response.data.error_description.includes('does not have access to caseload NWEB')) {
        type = 'You are not enabled for this service, please contact admin and request access.';
      } else if (error.response.data.error_description.includes('ORA-28001')) {
        type = 'Your password has expired.';
      }
    }
    return type;
  }

  const logout = (req, res) => {
    hmppsCookieOperations.clearCookie(res);
    res.redirect(LOGIN_PATH);
  };

  /**
   * A client who sends valid OAuth tokens when visits the login page is redirected to the
   * react application at '/'
   * @param req
   * @param res
   * @param next
   */
  const loginMiddleware = (req, res, next) => {
    hmppsCookieOperations.extractCookieValues(req, res.locals);
    if (contextProperties.hasTokens(res.locals)) { // implies authenticated
      res.redirect('/');
      return;
    }
    next();
  };

  const hmppsCookieMiddleware = async (req, res, next) => {
    try {
      hmppsCookieOperations.extractCookieValues(req, res.locals);
      if (contextProperties.hasTokens(res.locals)) {
        await tokenRefresher(res.locals);
        hmppsCookieOperations.setCookie(res, res.locals);
      }
      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * If the context does not contain an accessToken the client is denied access to the
   * application and is redirected to the login page.
   * (or if this is a 'data' request then the response is an Http 404 status (Not Found)
   * @param req
   * @param res
   * @param next
   */
  const requireLoginMiddleware = (req, res, next) => {
    if (contextProperties.hasTokens(res.locals)) {
      next();
      return;
    }
    const isXHRRequest = req.xhr || (req.headers.accept && req.headers.accept.indexOf('json') > -1);

    if (isXHRRequest) {
      res.status(401);
      res.json({ message: 'Session expired, please logout.', reason: 'session-expired' });
      return;
    }

    res.redirect(LOGIN_PATH);
  };


  app.get(LOGIN_PATH, loginMiddleware, loginIndex);
  app.post(LOGIN_PATH, login);
  app.get(LOGOUT_PATH, logout);

  app.use(hmppsCookieMiddleware);
  app.use(requireLoginMiddleware);

  /**
   * An end-point that does nothing.
   * Clients can periodically 'ping' this end-point to refresh the cookie 'session' and JWT token.
   * Must be installed after the middleware so that OAuth token refresh happens.
   */
  app.use('/heart-beat', (req, res) => { res.sendStatus(200); });
};

module.exports = { configureRoutes };
