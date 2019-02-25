const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

chai.use(sinonChai)
const { expect } = chai

const MockAdapter = require('axios-mock-adapter')
const querystring = require('querystring')
const { oauthApiFactory } = require('../../api/oauthApi')

const clientId = 'clientId'
const url = 'http://localhost'
const clientSecret = 'clientSecret'

const encodeClientCredentials = () =>
  Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')

const client = sinon.stub()
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
          expect(response.access_token).to.equal('newAccessToken')
        }))

      it('should save refresh token', () =>
        refreshResponse.then(response => {
          expect(response.refresh_token).to.equal('newRefreshToken')
        }))
    })

    it('should have set correct request configuration', () =>
      refreshResponse.then(response => {
        expect(requestConfig.method).to.equal('post')
        expect(requestConfig.baseURL).to.equal(url)
        expect(requestConfig.url).to.equal('/oauth/token')
        expect(requestConfig.data).to.equal('refresh_token=refreshToken&grant_type=refresh_token')
        expect(requestConfig.headers.authorization).to.equal(`Basic ${encodeClientCredentials()}`)
        expect(requestConfig.headers['Content-Type']).to.equal('application/x-www-form-urlencoded')
      }))
  })
})
