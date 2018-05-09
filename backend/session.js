const config = require('./config');

const sessionExpiryMinutes = config.hmppsCookie.expiryMinutes * 60 * 1000;

const encodeToBase64 = (string) => Buffer.from(string).toString('base64');
const decodedFromBase64 = (string) => Buffer.from(string, 'base64').toString('ascii');
const getNowInMinutes = () => Math.floor(Date.now() / 60e3);

const isAuthenticated = (req) => req.session && req.session.isAuthenticated;
const isHmppsCookieValid = (cookie) => {
  if (!cookie) {
    return false;
  }

  const cookieData = getHmppsCookieData(cookie);

  if (!cookieData.access_token || !cookieData.refresh_token) {
    return false;
  }

  return true;
};

const hmppsSessionMiddleWare = (req, res, next) => {
  const hmppsCookie = req.cookies[config.hmppsCookie.name];
  const isXHRRequest = req.xhr || req.headers.accept.indexOf('json') > -1;

  if (!isHmppsCookieValid(hmppsCookie)) {
    req.session = null;

    if (isXHRRequest) {
      res.status(401);
      res.end();
      return;
    }

    res.redirect('/auth/login');
    return;
  }

  const cookie = getHmppsCookieData(hmppsCookie);

  req.access_token = cookie.access_token;
  req.refresh_token = cookie.refresh_token;


  if (!isAuthenticated(req)) {
    req.session.isAuthenticated = true;
  }

  next();
};

const setHmppsCookie = (res, { access_token, refresh_token }) => {
  const tokens = encodeToBase64(JSON.stringify({ access_token, refresh_token, nowInMinutes: getNowInMinutes() }));

  const cookieConfig = {
    domain: config.hmppsCookie.domain,
    encode: String,
    expires: new Date(Date.now() + sessionExpiryMinutes),
    maxAge: sessionExpiryMinutes,
    path: '/',
    httpOnly: true,
    secure: config.app.production
  };

  res.cookie(config.hmppsCookie.name, tokens, cookieConfig);
};

const getHmppsCookieData = (cookie) => JSON.parse(decodedFromBase64(cookie));

const extendHmppsCookieMiddleWare = (req, res, next) => {
  const hmppsCookie = req.cookies[config.hmppsCookie.name];

  if (!hmppsCookie) {
    next();
    return;
  }

  const { nowInMinutes, access_token, refresh_token } = getHmppsCookieData(hmppsCookie);

  if (nowInMinutes === getNowInMinutes()) {
    next();
    return;
  }

  setHmppsCookie(res, { access_token, refresh_token });
  next();
};

const updateHmppsCookie = (res) => (tokens) => {
  setHmppsCookie(res, tokens);
};

const deleteHmppsCookie = (res) => {
  res.cookie(config.hmppsCookie.name, '', { expires: new Date(0), domain: config.hmppsCookie.domain, path: '/' });
};

const loginMiddleware = (req, res, next) => {
  if (req.url.includes('logout')) {
    next();
    return;
  }

  if (isAuthenticated(req)) {
    res.redirect('/');
    return;
  }
  next();
};

const service = {
  setHmppsCookie,
  updateHmppsCookie,
  deleteHmppsCookie,
  isAuthenticated,
  getNowInMinutes,
  hmppsSessionMiddleWare,
  extendHmppsCookieMiddleWare,
  loginMiddleware
};

module.exports = service;
