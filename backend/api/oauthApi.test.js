/** @type {any} */
const nock = require('nock')
const { oauthApiFactory } = require('./oauthApi')

const clientId = 'clientId'
const url = 'http://localhost'
const clientSecret = 'clientSecret'

const client = {}
const oauthApi = oauthApiFactory(client, { url: `${url}/oauth/token`, clientId, clientSecret })
const mock = nock(url, { reqheaders: { 'Content-Type': 'application/x-www-form-urlencoded' } })
const context = { some: 'context' }

describe('oauthApi tests', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  describe('refresh', () => {
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

  describe('currentUser', () => {
    const userDetails = { bob: 'hello there' }
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({
        then: () => userDetails,
      })
      actual = oauthApi.currentUser(context)
    })

    it('should return user details from endpoint', () => {
      expect(actual).toEqual(userDetails)
    })
    it('should call user endpoint', () => {
      expect(client.get).toBeCalledWith(context, '/api/user/me')
    })
  })

  describe('userDetails', () => {
    const userDetails = { bob: 'hello there' }
    const username = 'bob'
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({
        then: () => userDetails,
      })
      actual = oauthApi.userDetails(context, username)
    })

    it('should return user details from endpoint', () => {
      expect(actual).toEqual(userDetails)
    })
    it('should call user endpoint', () => {
      expect(client.get).toBeCalledWith(context, `/api/user/${username}`)
    })
  })

  describe('userEmail', () => {
    const userEmail = { email: 'bob@local' }
    const username = 'bob'
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({
        then: () => userEmail,
      })
      actual = oauthApi.userEmail(context, username)
    })

    it('should return user details from endpoint', () => {
      expect(actual).toEqual(userEmail)
    })
    it('should call user endpoint', () => {
      expect(client.get).toBeCalledWith(context, `/api/user/${username}/email`)
    })
  })

  describe('currentRoles', () => {
    const roles = { bob: 'hello there' }
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({
        then: () => roles,
      })
      actual = oauthApi.userRoles(context)
    })

    it('should return roles from endpoint', () => {
      expect(actual).toEqual(roles)
    })
    it('should call user endpoint', () => {
      expect(client.get).toBeCalledWith(context, '/api/user/me/roles')
    })
  })
})
