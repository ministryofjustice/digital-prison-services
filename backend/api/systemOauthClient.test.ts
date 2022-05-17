import { doesNotMatch } from 'assert'
import redisMock from 'redis-mock'
import { promisify } from 'util'
import systemOauthClient, { clientCredsSetup, getClientCredentialsTokens } from './systemOauthClient'

describe('system oauth client tests', () => {
  const oauthApi = { makeTokenRequest: {} }

  describe('Without Redis cache', () => {
    beforeEach(() => {
      oauthApi.makeTokenRequest = jest.fn().mockResolvedValue({
        access_token: '123',
        refresh_token: '456',
        expires_in: 600,
      })
      clientCredsSetup(null, oauthApi)
    })

    it('Gets and returns token', async () => {
      const clientCreds = await getClientCredentialsTokens({})
      expect(clientCreds).toEqual({
        access_token: '123',
        refresh_token: '456',
        expires_in: 600,
      })
    })

    it('Makes oauth requests each time', async () => {
      await getClientCredentialsTokens({})
      await getClientCredentialsTokens({})
      expect(oauthApi.makeTokenRequest).toHaveBeenCalledTimes(2)
    })
  })

  describe('With Redis cache', () => {
    let mockRedis

    beforeEach(() => {
      oauthApi.makeTokenRequest = jest.fn().mockResolvedValue({
        access_token: '123',
        refresh_token: '456',
        expires_in: 600,
      })
      mockRedis = redisMock.createClient()
      clientCredsSetup(mockRedis, oauthApi)
    })

    it('Gets and returns token on the first call with correct expiry', async () => {
      const clientCreds = await getClientCredentialsTokens('USER1')
      expect(clientCreds).toEqual({
        access_token: '123',
        refresh_token: '456',
        expires_in: 600,
      })
      expect(oauthApi.makeTokenRequest).toHaveBeenCalledTimes(1)
    })

    it('Returns the stored token the second call', async () => {
      await getClientCredentialsTokens('USER1')
      const clientCreds = await getClientCredentialsTokens('USER1')
      expect(clientCreds).toEqual({
        access_token: '123',
        refresh_token: null,
      })
      expect(oauthApi.makeTokenRequest).toHaveBeenCalledTimes(0)
    })

    it('Returns the stored token per user', async () => {
      await getClientCredentialsTokens('USER1')
      const secondUserClientCreds = await getClientCredentialsTokens('USER2')
      expect(secondUserClientCreds).toEqual({
        access_token: '123',
        refresh_token: '456',
        expires_in: 600,
      })
      expect(oauthApi.makeTokenRequest).toHaveBeenCalledWith(
        'grant_type=client_credentials&username=USER2',
        'PSH-client_credentials'
      )
    })

    it('Works when no username provided', async () => {
      const noUserClientCreds = await getClientCredentialsTokens(null)
      expect(noUserClientCreds).toEqual({
        access_token: '123',
        refresh_token: '456',
        expires_in: 600,
      })
    })

    it('Expires cached value 1 minute before token expiry', async () => {
      await getClientCredentialsTokens('USER1')

      const getTtl = promisify(mockRedis.ttl).bind(mockRedis)
      const expiryTime = await getTtl('CC_USER1')

      const tokenExpiry = 600
      expect(expiryTime).toBeLessThan(tokenExpiry - 59)
      expect(expiryTime).toBeGreaterThan(tokenExpiry - 120) // Allow 1 minute
    })
  })
})
