const MockAdapter = require('axios-mock-adapter')
const clientFactory = require('./oauthEnabledClient')
const contextProperties = require('../contextProperties')

describe('Test clients built by oauthEnabledClient', () => {
  it('should build something', () => {
    const client = clientFactory({ baseUrl: 'http://localhost:8080', timeout: 2000 })
    expect(client).not.toBeNull()
  })

  describe('Assert client behaviour', () => {
    const client = clientFactory({ baseUrl: 'http://localhost:8080', timeout: 2000 })

    const mock = new MockAdapter(client.axiosInstance)

    beforeEach(() => {
      mock.onGet('/api/users/me').reply(200, {})
    })

    afterEach(() => {
      mock.reset()
    })

    it('Should set the authorization header with "Bearer <access token>"', async () => {
      const context = {}
      contextProperties.setTokens({ access_token: 'a', refresh_token: 'b' }, context)

      const response = await client.get(context, '/api/users/me')

      expect(response.status).toEqual(200)
      expect(response.config.headers.authorization).toEqual('Bearer a')
    })

    it('Should succeed when there are no authorization headers', async () => {
      const response = await client.get({}, '/api/users/me')
      expect(response.config.headers.authorization).toBeUndefined()
    })
  })
})
