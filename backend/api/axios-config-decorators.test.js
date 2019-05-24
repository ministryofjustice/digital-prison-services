const decorators = require('./axios-config-decorators')
const contextProperties = require('../contextProperties')

describe('Axios request configuration decorartor tests', () => {
  it('The authorization decorartor should set the authorization header from the token store', () => {
    const context = {}
    contextProperties.setTokens({ access_token: 'access', refresh_token: 'refresh' }, context)

    const configuration = decorators.addAuthorizationHeader(context, {})
    expect(configuration).toEqual({
      headers: {
        authorization: 'Bearer access',
      },
    })
  })
})
