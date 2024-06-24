import nock from 'nock'
import clientFactory from './oauthEnabledClient'
import { locationsInsidePrisonApiFactory } from './locationsInsidePrisonApi'

const url = 'http://localhost:8080'

describe('Locations inside prison Api', () => {
  const client = clientFactory({ baseUrl: url, timeout: 2000 })
  const locationsInsidePrisonApi = locationsInsidePrisonApiFactory(client)
  const mock = nock(url)

  beforeEach(() => {
    nock.cleanAll()
  })

  it('calls to get groups correctly', async () => {
    const mockResponse = {
      key: 'A',
      name: 'Wing A',
      children: [],
    }

    mock.get('/locations/prison/ABC/groups').reply(200, mockResponse)

    const response = await locationsInsidePrisonApi.searchGroups({}, 'ABC')

    expect(response).toEqual(mockResponse)
  })
})
