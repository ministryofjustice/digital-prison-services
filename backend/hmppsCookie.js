/*
 * The 'HMPPS cookie' contains the client's OAuth access and refresh tokens.  The cookie lifetime is used as a way
 * of expiring a client that is idle - where idle means that the client has not made any kind of request to any server
 * where this cookie is managed.
 * (This is currently new-nomis-ui or omic-ui, but could be any server within the cookie domain that can manage the
 *  cookies payload and expiry).
 *
 */

const contextProperties = require('./contextProperties');

const encodeToBase64 = (string) => Buffer.from(string).toString('base64');
const decodedFromBase64 = (string) => Buffer.from(string, 'base64').toString('ascii');

const encodeCookieValue = (accessToken, refreshToken) =>
  encodeToBase64(JSON.stringify(
    {
      access_token: accessToken,
      refresh_token: refreshToken
    }));

const decodeCookieValue = (cookieValue) => cookieValue ? JSON.parse(decodedFromBase64(cookieValue)) : null;

/**
 * Configure and return the cookie operations.
 * @param name The name for the cookie
 * @param cookieLifetimeInMinutes the cookie lifetime (defines the cookie's maxAge and expires)
 * @param domain The cookie domain
 * @param secure boolean.  True if the cookie should be 'secure'.
 * @returns {{setCookie: setCookie, getCookieValue: getCookieValue, clearCookie: clearCookie}}
 */
const cookieOperationsFactory = ({ name, cookieLifetimeInMinutes, domain, secure }) => {
  const staticCookieConfiguration = {
    domain,
    encode: String,
    path: '/',
    httpOnly: true,
    secure
  };

  const cookieLifetimeInSeconds = cookieLifetimeInMinutes * 60;
  const cookieLifetimeInMilliseconds = cookieLifetimeInSeconds * 1000;

  const cookieConfiguration = () => Object.assign(
    {},
    staticCookieConfiguration,
    {
      expires: new Date(Date.now() + cookieLifetimeInMilliseconds),
      maxAge: cookieLifetimeInMilliseconds
    });


  const setCookie = (res, context) =>
    res.cookie(
      name,
      encodeCookieValue(
        contextProperties.getAccessToken(context),
        contextProperties.getRefreshToken(context)),
      cookieConfiguration());

  const extractCookieValues = (req, context) => {
    const tokens = decodeCookieValue(req.cookies[name]);
    if (tokens) {
      contextProperties.setTokens(context, tokens.access_token, tokens.refresh_token);
    }
  };

  const clearCookie = (res) => res.clearCookie(name, staticCookieConfiguration);

  return {
    setCookie,
    extractCookieValues,
    clearCookie
  };
};

module.exports = {
  encodeCookieValue,
  decodeCookieValue,
  cookieOperationsFactory
};
