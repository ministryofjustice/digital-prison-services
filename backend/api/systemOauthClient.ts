import querystring from 'querystring'
import clientFactory from './oauthEnabledClient'

import { oauthApiFactory } from './oauthApi'
import config from '../config'
import logger from '../log'

export const getClientCredentialsTokens = async (username) => {
  const oauthRequest = username
    ? querystring.stringify({ grant_type: 'client_credentials', username })
    : querystring.stringify({ grant_type: 'client_credentials' })

  const oauthResult = await oauthApiFactory(
    clientFactory({
      baseUrl: config.apis.oauth2.url,
      timeout: config.apis.oauth2.timeoutSeconds * 1000,
    }),
    {
      clientId: config.apis.oauth2.systemClientId,
      clientSecret: config.apis.oauth2.systemClientSecret,
      url: config.apis.oauth2.url,
    }
  ).makeTokenRequest(oauthRequest, 'PSH-client_credentials')

  logger.debug(`Oauth request for grant type 'client_credentials', result status: successful`)
  return oauthResult
}

export default {
  getClientCredentialsTokens,
}
