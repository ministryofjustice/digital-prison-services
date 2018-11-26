const axios = require('axios')
const querystring = require('querystring')
const logger = require('../log')
const errorStatusCode = require('../error-status-code')

const AuthClientErrorName = 'AuthClientError'
const AuthClientError = message => ({ name: AuthClientErrorName, message, stack: new Error().stack })

/**
 * Return an oauthApi built using the supplied configuration.
 * @param clientId
 * @param clientSecret
 * @param url
 * @returns a configured oauthApi instance
 */
const oauthApiFactory = ({ clientId, clientSecret, url }) => {
  const apiClientCredentials = Buffer.from(
    `${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`
  ).toString('base64')

  const oauthAxios = axios.create({
    baseURL: url,
    url: 'oauth/token',
    method: 'post',
    timeout: 30000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      authorization: `Basic ${apiClientCredentials}`,
    },
  })

  // eslint-disable-next-line camelcase
  const parseOauthTokens = ({ access_token, refresh_token }) => ({
    access_token,
    refresh_token,
  })

  const translateAuthClientError = error => {
    logger.info(`login error description = ${error}`)

    if (error.includes('has expired')) return 'Your password has expired.'
    if (error.includes('is locked')) return 'Your user account is locked.'
    if (error.includes('No credentials')) return 'Missing credentials.'
    if (error.includes('to caseload NWEB'))
      return 'You are not enabled for this service, please contact admin to request access.'

    return 'The username or password you have entered is invalid.'
  }

  const makeTokenRequest = (data, msg) =>
    oauthAxios({ data })
      .then(response => {
        logger.debug(
          `${msg} ${response.config.method} ${response.config.url} ${response.status} ${response.statusText}`
        )
        return parseOauthTokens(response.data)
      })
      .catch(error => {
        const status = errorStatusCode(error)
        const errorDesc = (error.response && error.response.data && error.response.data.error_description) || null

        if (parseInt(status, 10) < 500 && errorDesc !== null) {
          logger.info(`${msg} ${error.config.method} ${error.config.url} ${status} ${errorDesc}`)

          throw AuthClientError(translateAuthClientError(errorDesc))
        }

        logger.error(`${msg} ${error.config.method} ${error.config.url} ${status} ${error.message}`)
        throw error
      })

  /**
   * Perform OAuth authentication
   * @param username
   * @param password
   * @returns a Promise that is fulfilled when authentication has succeeded and the OAuth tokens have been returned. A
   * fulfilled promise has no result, but a rejected promise contains an axios response
   */
  const authenticate = (username, password) =>
    makeTokenRequest(
      `username=${username.toUpperCase()}&password=${password}&grant_type=password`,
      `authenticate: ${username}`
    )

  /**
   * Perform OAuth token refresh, returning the tokens to the caller. See scopedStore.run.
   * @returns A Promise that resolves when token refresh has succeeded and the OAuth tokens have been returned.
   */
  const refresh = refreshToken => makeTokenRequest(`refresh_token=${refreshToken}&grant_type=refresh_token`, 'refresh:')

  return {
    authenticate,
    refresh,
    // Expose the internals so they can be Monkey Patched for testing. Oo oo oo.
    oauthAxios,
  }
}

module.exports = { oauthApiFactory, AuthClientError, AuthClientErrorName }
