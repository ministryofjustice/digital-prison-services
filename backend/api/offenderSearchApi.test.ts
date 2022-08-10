import moment from 'moment'
import nock from 'nock'
import { PagingContext } from '../controllers/search/prisonerSearch'
import clientFactory from './oauthEnabledClient'

import { offenderSearchApiFactory } from './offenderSearchApi'

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
        const data = await offenderSearchApi.globalSearch(context, { search: 'params' }, null)
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
        const context = {} as any
        const results = [{ prisonerNumber: 'A1234BC' }]
        mock
          .post('/global-search?size=20')
          .reply(200, { content: results, pageable: { pageSize: 10, offset: 3 }, totalElements: 55 })
        await offenderSearchApi.globalSearch(context, { search: 'params' }, null)
        expect(context.responseHeaders).toEqual({ 'page-offset': 3, 'page-limit': 10, 'total-records': 55 })
      })

      it('Calls global search with minimal request / response', async () => {
        const results = [{ prisonerNumber: 'A1234BC' }]
        mock.post('/global-search?size=20').reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.globalSearch({}, { search: 'params' }, null)
        expect(data).toEqual([
          {
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
            locationDescription: 'Leeds',
          },
        ]
        mock.post('/global-search?size=20').reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.globalSearch({}, { search: 'params' }, null)
        expect(data).toEqual([
          {
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
  describe('GET requests', () => {
    describe('establishment search', () => {
      it('Passes context properties to request', async () => {
        const context = {
          requestHeaders: {
            'page-offset': 10,
            'page-limit': 2,
            'sort-fields': 'lastName,firstName',
            'sort-order': 'ASC',
          },
        }
        const results = [{ prisonerNumber: 'A1234BC', dateOfBirth: '01/01/1974', alerts: [] }]
        mock
          .get(`/prison/MDI/prisoners?page=5&size=2&sort=lastName,firstName,ASC`)
          .reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.establishmentSearch(context, 'MDI', {})
        expect(data.length).toEqual(1)
      })
      it('Passes context properties for some sort fields are mapped', async () => {
        const context = {
          requestHeaders: {
            'page-offset': 10,
            'page-limit': 2,
            'sort-fields': 'assignedLivingUnitDesc',
            'sort-order': 'DESC',
          },
        }
        const results = [{ prisonerNumber: 'A1234BC', dateOfBirth: '01/01/1974', alerts: [] }]
        mock
          .get(`/prison/MDI/prisoners?page=5&size=2&sort=cellLocation,DESC`)
          .reply(200, { content: results, pageable: {} })
        const data = await offenderSearchApi.establishmentSearch(context, 'MDI', {})
        expect(data.length).toEqual(1)
      })

      it('Sets pagination in context from response', async () => {
        const context: PagingContext = {
          requestHeaders: {
            'page-offset': 10,
            'page-limit': 2,
            'sort-fields': 'lastName,firstName',
            'sort-order': 'ASC',
          },
        }
        const results = [{ prisonerNumber: 'A1234BC', dateOfBirth: '01/01/1974', alerts: [] }]
        mock
          .get(`/prison/MDI/prisoners?page=5&size=2&sort=lastName,firstName,ASC`)
          .reply(200, { content: results, pageable: { pageSize: 10, offset: 3 }, totalElements: 55 })
        await offenderSearchApi.establishmentSearch(context, 'MDI', {})
        expect(context.responseHeaders).toEqual({ 'page-offset': 3, 'page-limit': 10, 'total-records': 55 })
      })

      it('will modify response content', async () => {
        const context: PagingContext = {
          requestHeaders: {
            'page-offset': 10,
            'page-limit': 2,
            'sort-fields': 'lastName,firstName',
            'sort-order': 'ASC',
          },
        }

        const dateOfBirthFor48YearOld = moment().subtract(48, 'years').format('YYYY-MM-DD')
        const results = [
          {
            prisonerNumber: 'Z0025ZZ',
            bookingId: '-25',
            bookNumber: 'Z00025',
            firstName: 'MATTHEW',
            middleNames: 'DAVID',
            lastName: 'SMITH',
            dateOfBirth: dateOfBirthFor48YearOld,
            gender: 'Male',
            ethnicity: 'White: British',
            youthOffender: false,
            status: 'ACTIVE OUT',
            prisonId: 'LEI',
            prisonName: 'Leeds',
            cellLocation: 'H-1',
            aliases: [],
            alerts: [{ alertCode: 'TACT' }],
            sentenceStartDate: '2009-09-09',
            releaseDate: '2023-03-03',
            confirmedReleaseDate: '2023-03-03',
            locationDescription: 'Leeds',
            category: 'CAT A',
          },
        ]
        mock
          .get(`/prison/MDI/prisoners?page=5&size=2&sort=lastName,firstName,ASC`)
          .reply(200, { content: results, pageable: { pageSize: 10, offset: 3 }, totalElements: 55 })
        const data = await offenderSearchApi.establishmentSearch(context, 'MDI', {})
        expect(data).toEqual([
          expect.objectContaining({
            dateOfBirth: dateOfBirthFor48YearOld,
            age: 48,
            alerts: [{ alertCode: 'TACT' }],
            alertsDetails: ['TACT'],
            assignedLivingUnitDesc: 'H-1',
            cellLocation: 'H-1',
            bookingId: -25,
            categoryCode: 'CAT A',
            category: 'CAT A',
            offenderNo: 'Z0025ZZ',
            prisonerNumber: 'Z0025ZZ',
          }),
        ])
      })
    })
  })
})
