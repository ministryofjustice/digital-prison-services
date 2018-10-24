const chai = require('chai')

const { expect } = chai

const MockAdapter = require('axios-mock-adapter')
const querystring = require('querystring')
const contextProperties = require('../../contextProperties')
const oauthApiFactory = require('../../api/oauthApi')

const clientId = 'clientId'
const url = 'http://localhost'
const clientSecret = 'clientSecret'

function encodeClientCredentials() {
  return new Buffer(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')
}

describe('oathApi tests', () => {
  it('Should send a valid auth request and save tokens', done => {
    const oauthApi = oauthApiFactory({ url, clientId, clientSecret })

    const mock = new MockAdapter(oauthApi.oauthAxios)

    mock.onAny('oauth/token').reply(200, {
      access_token: 'accessToken',
      token_type: 'bearer',
      refresh_token: 'refreshToken',
      expires_in: 59,
      scope: 'write',
      internalUser: true,
      jti: 'bf5e8f62-1d2a-4126-96e2-a4ae91997ba6',
    })

    // Some hackery to catch the configuration used by axios to make the authentication / refresh request.
    let requestConfig
    oauthApi.oauthAxios.interceptors.request.use(config => {
      requestConfig = config
      return config
    })

    const context = {}

    // When I call authenticate I expect the new access and refresh tokens to be added to the context object...
    oauthApi
      .authenticate(context, 'name', 'password')
      .then(() => {
        expect(contextProperties.getAccessToken(context)).to.equal('accessToken')
        expect(contextProperties.getRefreshToken(context)).to.equal('refreshToken')
      })
      .then(() => {
        // Confirm the outgoing request configuration.
        expect(requestConfig.method).to.equal('post')
        expect(requestConfig.baseURL).to.equal(url)
        expect(requestConfig.url).to.equal('/oauth/token')
        expect(requestConfig.headers.authorization).to.equal(`Basic ${encodeClientCredentials()}`)
        expect(requestConfig.data).to.equal('username=NAME&password=password&grant_type=password')
        expect(requestConfig.headers['Content-Type']).to.equal('application/x-www-form-urlencoded')
      })
      .then(done, done)
  })

  it('Should send a valid refresh request and store tokens', done => {
    const oauthApi = oauthApiFactory({ url, clientId, clientSecret })

    const mock = new MockAdapter(oauthApi.oauthAxios)

    mock.onAny('oauth/token').reply(200, {
      access_token: 'newAccessToken',
      token_type: 'bearer',
      refresh_token: 'newRefreshToken',
      expires_in: 59,
      scope: 'write',
      internalUser: true,
      jti: 'bf5e8f62-1d2a-4126-96e2-a4ae91997ba6',
    })

    let requestConfig
    oauthApi.oauthAxios.interceptors.request.use(config => {
      requestConfig = config
      return config
    })

    const obj = {}
    contextProperties.setTokens(obj, 'accessToken', 'refreshToken')

    oauthApi
      .refresh(obj)
      .then(() => {
        expect(contextProperties.getAccessToken(obj)).to.equal('newAccessToken')
        expect(contextProperties.getRefreshToken(obj)).to.equal('newRefreshToken')
      })
      .then(() => {
        expect(requestConfig.method).to.equal('post')
        expect(requestConfig.baseURL).to.equal(url)
        expect(requestConfig.url).to.equal('/oauth/token')
        expect(requestConfig.headers.authorization).to.equal(`Basic ${encodeClientCredentials()}`)
        expect(requestConfig.data).to.equal('refresh_token=refreshToken&grant_type=refresh_token')
        expect(requestConfig.headers['Content-Type']).to.equal('application/x-www-form-urlencoded')
      })
      .then(done, done)
  })
})
