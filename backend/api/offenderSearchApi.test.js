const nock = require('nock')

const clientFactory = require('./oauthEnabledClient')
const { offenderSearchApiFactory } = require('./offenderSearchApi')

const hostname = 'http://localhost:8080'

describe('offender search api tests', () => {
  const client = clientFactory({ baseUrl: `${hostname}`, timeout: 2000 })
  const offenderSearchApi = offenderSearchApiFactory(client)
  const mock = nock(hostname)

  afterEach(() => {
    nock.cleanAll()
  })

  describe('POST requests', () => {
    describe('global search', () => {
      it('Passes context properties to request', async () => {
        const context = {
          requestHeaders: {
            'page-offset': 10,
            'page-limit': 2,
          },
        }
        const results = [{ prisonerNumber: 'A1234BC' }]
        mock.post('/global-search?size=2&page=5').reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.globalSearch(context, { search: 'params' })
        expect(data.length).toEqual(1)
      })

      it('Allows override of page limit', async () => {
        const context = {
          requestHeaders: {
            'page-offset': 10,
            'page-limit': 2,
          },
        }
        const results = [{ prisonerNumber: 'A1234BC' }]
        mock.post('/global-search?size=100&page=5').reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.globalSearch(context, { search: 'params' }, 100)
        expect(data.length).toEqual(1)
      })

      it('Sets pagination in context from response', async () => {
        const context = {}
        const results = [{ prisonerNumber: 'A1234BC' }]
        mock
          .post('/global-search?size=20')
          .reply(200, { content: results, pageable: { pageSize: 10, offset: 3 }, totalElements: 55 })
        await offenderSearchApi.globalSearch(context, { search: 'params' })
        expect(context.responseHeaders).toEqual({ 'page-offset': 3, 'page-limit': 10, 'total-records': 55 })
      })

      it('Calls global search with minimal request / response', async () => {
        const results = [{ prisonerNumber: 'A1234BC' }]
        mock.post('/global-search?size=20').reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.globalSearch({}, { search: 'params' })
        expect(data).toEqual([
          {
            uiId: undefined,
            offenderNo: 'A1234BC',
            firstName: undefined,
            lastName: undefined,
            latestBookingId: NaN,
            latestLocation: undefined,
            latestLocationId: undefined,
            dateOfBirth: undefined,
            currentlyInPrison: 'N',
            currentWorkingLastName: undefined,
            currentWorkingFirstName: undefined,
          },
        ])
      })

      it('Calls global search and modifies response content', async () => {
        const results = [
          {
            prisonerNumber: 'Z0025ZZ',
            bookingId: '-25',
            bookNumber: 'Z00025',
            firstName: 'MATTHEW',
            middleNames: 'DAVID',
            lastName: 'SMITH',
            dateOfBirth: '01/01/1974',
            gender: 'Male',
            ethnicity: 'White: British',
            youthOffender: false,
            status: 'ACTIVE OUT',
            prisonId: 'LEI',
            prisonName: 'Leeds',
            cellLocation: 'H-1',
            aliases: [],
            alerts: [],
            sentenceStartDate: '2009-09-09',
            releaseDate: '2023-03-03',
            confirmedReleaseDate: '2023-03-03',
            uiId: 'Tw4PcPHG6',
            locationDescription: 'Leeds',
          },
        ]
        mock.post('/global-search?size=20').reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.globalSearch({}, { search: 'params' })
        expect(data).toEqual([
          {
            uiId: 'Tw4PcPHG6',
            offenderNo: 'Z0025ZZ',
            firstName: 'MATTHEW',
            lastName: 'SMITH',
            latestBookingId: -25,
            latestLocation: 'Leeds',
            latestLocationId: 'LEI',
            dateOfBirth: '01/01/1974',
            currentlyInPrison: 'Y',
            currentWorkingFirstName: 'MATTHEW',
            currentWorkingLastName: 'SMITH',
          },
        ])
      })
    })
  })
})
