const MockAdapter = require('axios-mock-adapter')
const querystring = require('querystring')
const { oauthApiFactory } = require('./oauthApi')

const clientId = 'clientId'
const url = 'http://localhost'
const clientSecret = 'clientSecret'

const encodeClientCredentials = () =>
  Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')

const client = jest.fn()
const oauthApi = oauthApiFactory(client, { url, clientId, clientSecret })
const mock = new MockAdapter(oauthApi.oauthAxios)

const baseResponse = {
  token_type: 'bearer',
  expires_in: 59,
  scope: 'write',
  internalUser: true,
  jti: 'bf5e8f62-1d2a-4126-96e2-a4ae91997ba6',
}

describe('oathApi tests', () => {
  let requestConfig
  beforeAll(() => {
    // Some hackery to catch the configuration used by axios to make the authentication / refresh request.
    oauthApi.oauthAxios.interceptors.request.use(config => {
      requestConfig = config
      return config
    })
  })

  describe('refresh', () => {
    let refreshResponse

    beforeAll(() => {
      mock.reset()
      mock.onAny('oauth/token').reply(200, {
        ...baseResponse,
        access_token: 'newAccessToken',
        refresh_token: 'newRefreshToken',
      })

      refreshResponse = oauthApi.refresh('refreshToken')
    })

    describe('should save tokens', () => {
      it('should save access token', () =>
        refreshResponse.then(response => {
          expect(response.access_token).toEqual('newAccessToken')
        }))

      it('should save refresh token', () =>
        refreshResponse.then(response => {
          expect(response.refresh_token).toEqual('newRefreshToken')
        }))
    })

    it('should have set correct request configuration', () =>
      refreshResponse.then(response => {
        expect(requestConfig.method).toEqual('post')
        expect(requestConfig.baseURL).toEqual(url)
        expect(requestConfig.url).toEqual('http://localhost/oauth/token')
        expect(requestConfig.data).toEqual('refresh_token=refreshToken&grant_type=refresh_token')
        expect(requestConfig.headers.authorization).toEqual(`Basic ${encodeClientCredentials()}`)
        expect(requestConfig.headers['Content-Type']).toEqual('application/x-www-form-urlencoded')
      }))
  })
})
