import nock from 'nock'
import clientFactory from './oauthEnabledClient'
import { restrictedPatientApiFactory } from './restrictedPatientApi'

const url = 'http://localhost:8080'

describe('Restricted Patient Api', () => {
  const client = clientFactory({ baseUrl: url, timeout: 2000 })
  const restrictedPatientApi = restrictedPatientApiFactory(client)
  const mock = nock(url)

  beforeEach(() => {
    nock.cleanAll()
  })

  it('filters restricted patient correctly', async () => {
    mock.get('/restricted-patient/prison-number/A8374DY').reply(200, {
      prisonerNumber: 'A8374DY',
      fromLocation: {
        agencyId: 'MDI',
        description: 'Moorland (HMP & YOI)',
        longDescription: 'HMP & YOI Moorland Prison near Doncaster',
        agencyType: 'INST',
        active: true,
      },
      hospitalLocation: {
        agencyId: 'QABETH',
        description: 'Queen Elizabeth Hospital',
        longDescription: 'Queen Elizabeth Hospital',
        agencyType: 'HSHOSP',
        active: true,
      },
      supportingPrison: {
        agencyId: 'MDI',
        description: 'Moorland (HMP & YOI)',
        longDescription: 'HMP & YOI Moorland Prison near Doncaster',
        agencyType: 'INST',
        active: true,
      },
      dischargeTime: '2022-05-10T12:52:24.181218',
      createDateTime: '2022-05-10T12:52:24.184127',
      createUserId: 'TWRIGHT',
    })

    const response = await restrictedPatientApi.isCaseLoadRestrictedPatient({}, 'A8374DY', 'MDI')

    expect(response).toEqual(true)
  })

  it('it returns false if 404', async () => {
    mock.get('/restricted-patient/prison-number/A8374DZ').reply(404, {})

    const response = await restrictedPatientApi.isCaseLoadRestrictedPatient({}, 'A8374DZ', 'MDI')

    expect(response).toEqual(false)
  })
})
