const querystring = require('querystring')
const oauthApi = require('./oauthApi')
const clientFactory = require('./oauthEnabledClient')

const config = require('../config')
const logger = require('../log')

const getClientCredentialsTokens = async username => {
  const oauthRequest = querystring.stringify({ grant_type: 'client_credentials', username })

  const oauthResult = await oauthApi
    .oauthApiFactory(
      clientFactory({
        baseUrl: config.apis.oauth2.url,
        timeout: config.apis.oauth2.timeoutSeconds * 1000,
      }),
      {
        clientId: config.apis.oauth2.systemClientId,
        clientSecret: config.apis.oauth2.systemClientSecret,
        url: config.apis.oauth2.url,
      }
    )
    .makeTokenRequest(oauthRequest, 'PSH-client_credentials')

  logger.debug(`Oauth request for grant type '${oauthRequest.grant_type}', result status: ${oauthResult.status}`)
  return oauthResult
}

module.exports = {
  getClientCredentialsTokens,
}
