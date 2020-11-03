const nock = require('nock')
const { oauthApiFactory } = require('./oauthApi')

const clientId = 'clientId'
const url = 'http://localhost/oauth/token'
const clientSecret = 'clientSecret'

const client = jest.fn()
const oauthApi = oauthApiFactory(client, { url, clientId, clientSecret })
const mock = nock('http://localhost', { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

describe('oathApi tests', () => {
  describe('refresh', () => {
    beforeEach(() => {
      nock.cleanAll()
    })

    describe('should save tokens', () => {
      it('should save access token', async () => {
        mock
          .post('/oauth/token', { grant_type: 'refresh_token', refresh_token: 'refreshToken' })
          .basicAuth({ user: clientId, pass: clientSecret })
          .reply(200, {
            token_type: 'bearer',
            expires_in: 59,
            scope: 'write',
            internalUser: true,
            jti: 'bf5e8f62-1d2a-4126-96e2-a4ae91997ba6',
            access_token: 'newAccessToken',
            refresh_token: 'newRefreshToken',
          })
        const response = await oauthApi.refresh('refreshToken')
        expect(response.access_token).toEqual('newAccessToken')
        expect(response.refresh_token).toEqual('newRefreshToken')
      })
    })
  })
})
