import nock from 'nock'
import { hmppsManageUsersApiFactory } from './hmppsManageUsersApi'
import clientFactory from './oauthEnabledClient'

const hostname = 'http://localhost:8080'
const client = clientFactory({ baseUrl: `${hostname}`, timeout: 2000 })
const hmppsManageUsersApi = hmppsManageUsersApiFactory(client)
const context = {
  access_token: 'token',
}

describe('hmppsManageUsersApi tests', () => {
  beforeEach(() => {
    nock.cleanAll()
    jest.clearAllMocks()
  })

  describe('currentUser', () => {
    const userDetails = { bob: 'hello there' }

    beforeEach(() => {
      client.get = jest.fn().mockResolvedValue({
        body: userDetails,
      })
    })

    it('should return user details from endpoint', async () => {
      const result = await hmppsManageUsersApi.currentUser(context)
      expect(result).toEqual(userDetails)
    })
    it('should call user endpoint', async () => {
      await hmppsManageUsersApi.currentUser(context)
      expect(client.get).toBeCalledWith(context, '/users/me')
    })
  })

  describe('userDetails', () => {
    const userDetails = { bob: 'hello there' }
    const username = 'bob'

    beforeEach(() => {
      client.get = jest.fn().mockResolvedValue({
        body: userDetails,
        headers: {},
      })
    })

    it('should return user details from endpoint', async () => {
      const result = await hmppsManageUsersApi.userDetails(context, username)
      expect(result).toEqual(userDetails)
    })

    it('should call user endpoint with correct args', async () => {
      await hmppsManageUsersApi.userDetails(context, username)

      expect(client.get).toHaveBeenCalledWith(context, `/users/${username}`, {
        resultsLimit: undefined,
        retryOverride: undefined,
      })
    })

    it('should return null when API returns 404', async () => {
      client.get = jest.fn().mockRejectedValue({
        response: { status: 404 },
      })

      const result = await hmppsManageUsersApi.userDetails(context, username)

      expect(result).toBeNull()
    })

    it('should throw error for non-404 errors', async () => {
      const error = { response: { status: 500 } }
      client.get = jest.fn().mockRejectedValue(error)

      await expect(hmppsManageUsersApi.userDetails(context, username)).rejects.toEqual(error)
    })
  })

  describe('userEmail', () => {
    const userEmail = { email: 'bob@local' }
    const username = 'bob'

    beforeEach(() => {
      client.get = jest.fn().mockResolvedValue({
        body: userEmail,
      })
    })

    it('should return user details from endpoint', async () => {
      const result = await hmppsManageUsersApi.userEmail(context, username)
      expect(result).toEqual(userEmail)
    })
    it('should call user endpoint', async () => {
      await hmppsManageUsersApi.userEmail(context, username)
      expect(client.get).toBeCalledWith(context, `/users/${username}/email`)
    })
  })
})
