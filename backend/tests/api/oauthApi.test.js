const chai = require('chai')

const { expect } = chai

const MockAdapter = require('axios-mock-adapter')
const querystring = require('querystring')
const { oauthApiFactory } = require('../../api/oauthApi')

const clientId = 'clientId'
const url = 'http://localhost'
const clientSecret = 'clientSecret'

const encodeClientCredentials = () =>
  Buffer.from(`${querystring.escape(clientId)}:${querystring.escape(clientSecret)}`).toString('base64')

const oauthApi = oauthApiFactory({ url, clientId, clientSecret })
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

  describe('authenticate', () => {
    describe('successful path', () => {
      let authenticateResponse

      beforeAll(() => {
        mock.reset()
        mock.onAny('oauth/token').reply(200, {
          ...baseResponse,
          access_token: 'accessToken',
          refresh_token: 'refreshToken',
        })

        authenticateResponse = oauthApi.authenticate('name', 'password')
      })

      describe('should save tokens', () => {
        it('should save access token', () =>
          authenticateResponse.then(response => {
            expect(response.access_token).to.equal('accessToken')
          }))

        it('should save refresh token', () =>
          authenticateResponse.then(response => {
            expect(response.refresh_token).to.equal('refreshToken')
          }))
      })

      it('should have set correct request configuration', () =>
        authenticateResponse.then(() => {
          expect(requestConfig.method).to.equal('post')
          expect(requestConfig.baseURL).to.equal(url)
          expect(requestConfig.url).to.equal('/oauth/token')
          expect(requestConfig.data).to.equal('username=NAME&password=password&grant_type=password')
          expect(requestConfig.headers.authorization).to.equal(`Basic ${encodeClientCredentials()}`)
          expect(requestConfig.headers['Content-Type']).to.equal('application/x-www-form-urlencoded')
        }))
    })

    describe('error scenarios', () => {
      beforeEach(() => {
        mock.reset()
      })

      it('should rethrow error if server fault', () => {
        mock.onAny('oauth/token').reply(config => {
          const error = new Error('some server problem')
          error.config = config
          error.response = {
            status: 500,
          }
          return Promise.reject(error)
        })

        return oauthApi.authenticate('name', 'password').catch(error => {
          expect(error.message).to.be.equal('some server problem')
        })
      })

      it('should translate expired client error', () => {
        mock.onAny('oauth/token').reply(config => {
          const error = new Error('some server problem')
          error.config = config
          error.response = {
            status: 400,
            data: {
              error_description: 'Password for bob has expired.',
            },
          }
          return Promise.reject(error)
        })

        return oauthApi.authenticate('name', 'password').catch(error => {
          expect(error.message).to.be.equal('Your password has expired.')
        })
      })

      it('should translate locked client error', () => {
        mock.onAny('oauth/token').reply(config => {
          const error = new Error('some server problem')
          error.config = config
          error.response = {
            status: 400,
            data: {
              error_description: 'Password for bob is locked.',
            },
          }
          return Promise.reject(error)
        })

        return oauthApi.authenticate('name', 'password').catch(error => {
          expect(error.message).to.be.equal('Your user account is locked.')
        })
      })

      it('should translate credentials client error', () => {
        mock.onAny('oauth/token').reply(config => {
          const error = new Error('some server problem')
          error.config = config
          error.response = {
            status: 400,
            data: {
              error_description: 'No credentials supplied.',
            },
          }
          return Promise.reject(error)
        })

        return oauthApi.authenticate('name', 'password').catch(error => {
          expect(error.message).to.be.equal('Missing credentials.')
        })
      })

      it('should translate other client errors', () => {
        mock.onAny('oauth/token').reply(config => {
          const error = new Error('some server problem')
          error.config = config
          error.response = {
            status: 400,
            data: {
              error_description: 'Something weird went on.',
            },
          }
          return Promise.reject(error)
        })

        return oauthApi.authenticate('name', 'password').catch(error => {
          expect(error.message).to.be.equal('The username or password you have entered is invalid.')
        })
      })
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
