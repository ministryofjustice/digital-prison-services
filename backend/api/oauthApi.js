const axios = require('axios')
const querystring = require('querystring')
const logger = require('../log')
const contextProperties = require('../contextProperties')

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
    timeout: 10000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const makeRequest = (context, data, msg) =>
    oauthAxios({
      data,
      headers: { authorization: `Basic ${apiClientCredentials}` },
    })
      .then(response => {
        contextProperties.setTokens(context, response.data.access_token, response.data.refresh_token)
        logger.debug(
          `${msg} ${response.config.method} ${response.config.url} ${response.status} ${response.statusText}`
        )
      })
      .catch(error => {
        const status = error.response ? error.response.status : '-'
        logger.warn(`${msg} ${error.config.method} ${error.config.url} ${status} ${error.message}`)
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
    makeRequest(context, `username=${username.toUpperCase()}&password=${password}&grant_type=password`, 'authenticate:')

  /**
   * Perform OAuth token refresh, storing the returned tokens in the supplied context. See scopedStore.run.
   * @returns A Promise that resolves when token refresh has succeeded and the OAuth tokens have been stored.
   */
  const refresh = context =>
    makeRequest(
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

module.exports = oauthApiFactory
