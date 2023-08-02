import nock from 'nock'
import { hmppsManageUsersApiFactory } from './hmppsManageUsersApi'
import clientFactory from './oauthEnabledClient'

const hostname = 'http://localhost:8080'
const client = clientFactory({ baseUrl: `${hostname}`, timeout: 2000 })
const hmppsManageUsersApi = hmppsManageUsersApiFactory(client)
const context = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJhdXRob3JpdGllcyI6WyJST0xFX1RFU1QiXX0.brDYlcg4pVOcz5hp1ejVWLNYKZsYYWT4vz_N52m0JzA',
}

describe('hmppsManageUsersApi tests', () => {
  beforeEach(() => {
    nock.cleanAll()
  })

  describe('currentUser', () => {
    const userDetails = { bob: 'hello there' }
    let actual

    beforeEach(() => {
      client.get = jest.fn().mockReturnValue({
        then: () => userDetails,
      })
      actual = hmppsManageUsersApi.currentUser(context)
    })

    it('should return user details from endpoint', () => {
      expect(actual).toEqual(userDetails)
    })
    it('should call user endpoint', () => {
      expect(client.get).toBeCalledWith(context, '/users/me')
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
      actual = hmppsManageUsersApi.userDetails(context, username)
    })

    it('should return user details from endpoint', () => {
      expect(actual).toEqual(userDetails)
    })
    it('should call user endpoint', () => {
      expect(client.get).toBeCalledWith(context, `/users/${username}`)
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
      actual = hmppsManageUsersApi.userEmail(context, username)
    })

    it('should return user details from endpoint', () => {
      expect(actual).toEqual(userEmail)
    })
    it('should call user endpoint', () => {
      expect(client.get).toBeCalledWith(context, `/users/${username}/email`)
    })
  })

})
