import nock from 'nock'
import config from '../config'
import clientFactory from './oauthEnabledClient'
import { prisonApiFactory } from './prisonApi'

const url = 'http://localhost:8080'

describe('Prison Api', () => {
  const client = clientFactory({ baseUrl: url, timeout: 2000 })
  const prisonAPi = prisonApiFactory(client)
  const mock = nock(url)

  beforeEach(() => {
    nock.cleanAll()
  })

  it('calls /api/movements/transfers correctly', async () => {
    mock
      .get('/api/movements/transfers')
      .query({
        agencyId: 'MDI',
        releaseEvents: true,
        transferEvents: true,
        courtEvents: true,
        toDateTime: '2020-10-10T10:00',
        fromDateTime: '2020-10-10T10:00',
      })
      .reply(200, {
        courtEvents: [],
        transferEvents: [],
        releaseEvents: [],
      })

    const response = await prisonAPi.getTransfers(
      {},
      {
        agencyId: 'MDI',
        releaseEvents: true,
        transferEvents: true,
        courtEvents: true,
        toDateTime: '2020-10-10T10:00',
        fromDateTime: '2020-10-10T10:00',
      }
    )

    expect(response).toEqual({
      courtEvents: [],
      transferEvents: [],
      releaseEvents: [],
    })
  })

  it('calls /api/offenders/{offenderNo}/bookings/latest/alerts correctly', async () => {
    mock
      .get('/api/offenders/AA1234A/bookings/latest/alerts')
      .query({
        alertCodes: 'ABC,DEF',
        sort: 'dateCreated',
        direction: 'DESC',
      })
      .reply(200, [
        {
          alertId: 1,
        },
        {
          alertId: 2,
        },
      ])

    const response = await prisonAPi.getAlertsForLatestBooking(
      {},
      {
        offenderNo: 'AA1234A',
        alertCodes: ['ABC', 'DEF'],
        sortBy: 'dateCreated',
        sortDirection: 'DESC',
      }
    )

    expect(response).toEqual([
      {
        alertId: 1,
      },
      {
        alertId: 2,
      },
    ])
  })
})
