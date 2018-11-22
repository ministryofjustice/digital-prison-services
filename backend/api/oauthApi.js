const axios = require('axios')
const querystring = require('querystring')
const logger = require('../log')
const contextProperties = require('../contextProperties')
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

  const translateAuthClientError = error => {
    logger.info(`login error description = ${error}`)

    if (error.includes('has expired')) return 'Your password has expired.'
    if (error.includes('is locked')) return 'Your user account is locked.'
    if (error.includes('No credentials')) return 'Missing credentials.'
    if (error.includes('to caseload NWEB'))
      return 'You are not enabled for this service, please contact admin to request access.'

    return 'The username or password you have entered is invalid.'
  }

  const makeTokenRequest = (context, data, msg) =>
    oauthAxios({ data })
      .then(response => {
        contextProperties.setTokens(response.data, context)
        logger.debug(
          `${msg} ${response.config.method} ${response.config.url} ${response.status} ${response.statusText}`
        )
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
   * Perform OAuth authentication, storing the returned tokens in the supplied context.
   * @param context The request scoped context.
   * @param username
   * @param password
   * @returns a Promise that is fulfilled when authentication has succeeded and the OAuth tokens have been stored. A
   * fulfilled promise has no result, but a rejected promise contains an axios response
   */
  const authenticate = (context, username, password) =>
    makeTokenRequest(
      context,
      `username=${username.toUpperCase()}&password=${password}&grant_type=password`,
      `authenticate: ${username}`
    )

  /**
   * Perform OAuth token refresh, storing the returned tokens in the supplied context. See scopedStore.run.
   * @returns A Promise that resolves when token refresh has succeeded and the OAuth tokens have been stored.
   */
  const refresh = context =>
    makeTokenRequest(
      context,
      `refresh_token=${contextProperties.getRefreshToken(context)}&grant_type=refresh_token`,
      'refresh:'
    )

  return {
    authenticate,
    refresh,
    // Expose the internals so they can be Monkey Patched for testing. Oo oo oo.
    oauthAxios,
  }
}

module.exports = { oauthApiFactory, AuthClientError, AuthClientErrorName }
