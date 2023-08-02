import nock from 'nock'
import clientFactory from './oauthEnabledClient'
import { nonAssociationsApiFactory } from './nonAssociationsApi'

const url = 'http://localhost:8080'

describe('Non Associations Api', () => {
  const client = clientFactory({ baseUrl: url, timeout: 2000 })
  const nonAssociationsApi = nonAssociationsApiFactory(client)
  const mock = nock(url)

  beforeEach(() => {
    nock.cleanAll()
  })

  describe('calls legacy non associations', () => {
    it('calls /api/offenders/{offenderNo}/non-association-details correctly', async () => {
      const mockResponse = {
        offenderNo: 'A4564AB',
        firstName: 'Alan',
        lastName: 'Adams',
        agencyId: 'ABC',
        agencyDescription: 'ALCATRAZ (HMP)',
        assignedLivingUnitDescription: 'ABC-D-1-001',
        nonAssociations: [],
      }

      mock.get('/legacy/api/offenders/A4564AB/non-association-details?currentPrisonOnly=true&excludeInactive=true').reply(200, mockResponse)

      const response = await nonAssociationsApi.getNonAssociations({}, 'A4564AB')

      expect(response).toEqual(mockResponse)
    })
  })
})
