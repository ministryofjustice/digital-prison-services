import nock from 'nock'
import clientFactory from './oauthEnabledClient'
import { locationsInsidePrisonApiFactory } from './locationsInsidePrisonApi'

const url = 'http://localhost:8080'
const accessToken = 'token-1'

describe('Locations Inside Prison Api', () => {
  const client = clientFactory({ baseUrl: url, timeout: 2000 })
  const locationsInsidePrisonApi = locationsInsidePrisonApiFactory(client)
  const mock = nock(url)

  beforeEach(() => {
    nock.cleanAll()
  })

  describe('getAgencyGroupLocationPrefix', () => {
    it('Successfully retrieves a location prefix', async () => {
      const mockResponse = {
        locationPrefix: 'MDI-1-',
      }

      mock
        .get('/locations/prison/MDI/group/block-1/location-prefix')
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(200, mockResponse)

      const response = await locationsInsidePrisonApi.getAgencyGroupLocationPrefix(
        { access_token: accessToken },
        'MDI',
        'block-1'
      )

      expect(response).toEqual(mockResponse)
    })

    it('Returns null when 404 error occurs', async () => {
      mock
        .get('/locations/prison/MDI/group/block-1/location-prefix')
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(404)

      const response = await locationsInsidePrisonApi.getAgencyGroupLocationPrefix(
        { access_token: accessToken },
        'MDI',
        'block-1'
      )

      expect(response).toEqual(null)
    })

    it('it throws the error', async () => {
      mock
        .get('/locations/prison/MDI/group/block-1/location-prefix')
        .matchHeader('authorization', `Bearer ${accessToken}`)
        .reply(400)

      await expect(
        locationsInsidePrisonApi.getAgencyGroupLocationPrefix({ access_token: accessToken }, 'MDI', 'block-1')
      ).rejects.toThrow('Bad Request')
    })
  })

  describe('getAgencyGroupLocations', () => {
    it('gets group locations correctly', async () => {
      const mockResponse = {
        key: 'A',
        name: 'Wing A',
        children: [],
      }

      mock.get('/locations/groups/MDI/1').reply(200, mockResponse)
      const response = await locationsInsidePrisonApi.getAgencyGroupLocations({}, 'MDI', 1)
      expect(response).toEqual(mockResponse)
    })

    it('Returns null when 404 error occurs', async () => {
      mock.get('/locations/groups/MDI/1').matchHeader('authorization', `Bearer ${accessToken}`).reply(404)

      const response = await locationsInsidePrisonApi.getAgencyGroupLocations({ access_token: accessToken }, 'MDI', '1')

      expect(response).toEqual(null)
    })

    it('it throws the error', async () => {
      mock.get('/locations/groups/MDI/1').matchHeader('authorization', `Bearer ${accessToken}`).reply(400)

      await expect(
        locationsInsidePrisonApi.getAgencyGroupLocations({ access_token: accessToken }, 'MDI', '1')
      ).rejects.toThrow('Bad Request')
    })
  })

  describe('getSearchGroups', () => {
    it('gets groups correctly', async () => {
      const mockResponse = {
        key: 'A',
        name: 'Wing A',
        children: [],
      }

      mock.get('/locations/prison/MDI/groups').reply(200, mockResponse)
      const response = await locationsInsidePrisonApi.getSearchGroups({ access_token: accessToken }, 'MDI')
      expect(response).toEqual(mockResponse)
    })
    it('Returns null when 404 error occurs', async () => {
      mock.get('/locations/prison/MDI/groups').matchHeader('authorization', `Bearer ${accessToken}`).reply(404)

      const response = await locationsInsidePrisonApi.getSearchGroups({ access_token: accessToken }, 'MDI')
      expect(response).toEqual(null)
    })

    it('it throws the error', async () => {
      mock.get('/locations/prison/MDI/groups').matchHeader('authorization', `Bearer ${accessToken}`).reply(400)

      await expect(locationsInsidePrisonApi.getSearchGroups({ access_token: accessToken }, 'MDI')).rejects.toThrow(
        'Bad Request'
      )
    })
  })
})
