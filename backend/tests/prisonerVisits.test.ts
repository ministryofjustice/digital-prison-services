import moment from 'moment'
import prisonerVisits from '../controllers/prisonerProfile/prisonerVisits'

describe('Prisoner visits', () => {
  const pageSize = 2
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      originalUrl: 'http://localhost',
      params: { offenderNo },
      query: {},
      protocol: 'http',
      get: jest.fn().mockReturnValue('localhost'),
    }
    res = { locals: {}, render: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({})
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitTypes' does not exist on type '{... Remove this comment to see the full error message
    prisonApi.getVisitTypes = jest.fn().mockResolvedValue([])
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsForBookingWithVisitors' does no... Remove this comment to see the full error message
    prisonApi.getVisitsForBookingWithVisitors = jest.fn().mockResolvedValue({
      pageable: {
        offset: {},
        pageNumber: {},
      },
    })

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; logError: any; ... Remove this comment to see the full error message
    controller = prisonerVisits({ prisonApi, logError, pageSize })
  })

  it('should get the prisoner details and visit types', async () => {
    await controller(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitTypes' does not exist on type '{... Remove this comment to see the full error message
    expect(prisonApi.getVisitTypes).toHaveBeenCalledWith(res.locals)
  })

  describe('Visits results', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockResolvedValue({ bookingId, firstName: 'Prisoner', lastName: 'Name' })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsForBookingWithVisitors' does no... Remove this comment to see the full error message
      prisonApi.getVisitsForBookingWithVisitors.mockResolvedValue({
        content: [
          {
            visitors: [
              {
                personId: 1674445,
                lastName: 'VICTETRIS',
                firstName: 'ALVRULEMEKA',
                leadVisitor: true,
                relationship: 'Other - Social',
              },
              { personId: 4729491, lastName: 'BLOB', firstName: 'BLOBY', leadVisitor: false, relationship: 'Brother' },
              {
                personId: 4729489,
                lastName: 'BULL',
                firstName: 'DOM',
                dateOfBirth: '1970-04-21',
                leadVisitor: false,
                relationship: 'Cousin',
              },
            ],
            visitDetails: {
              startTime: '2020-07-22T09:00:00',
              endTime: '2020-07-22T11:45:00',
              eventOutcomeDescription: 'Absence',
            },
          },
          {
            visitors: [
              { personId: 4729491, lastName: 'BLOB', firstName: 'BLOBY', leadVisitor: true, relationship: 'Brother' },
            ],
            visitDetails: {
              startTime: '2020-08-21T09:00:00',
              endTime: '2020-08-21T11:45:00',
              eventOutcomeDescription: 'Attended',
              eventStatus: 'CANC',
              eventStatusDescription: 'Cancelled',
              cancelReasonDescription: 'Operational Reasons-All Visits Cancelled',
            },
          },
          {
            visitors: [
              {
                personId: 4729490,
                lastName: 'SMITH',
                firstName: 'JOHN',
                dateOfBirth: '2008-01-01',
                leadVisitor: true,
                relationship: 'Grandson',
              },
            ],
            visitDetails: {
              startTime: '2020-08-01T13:30:00',
              endTime: '2020-08-01T16:00:00',
              eventOutcomeDescription: 'Absence',
            },
          },
          {
            visitors: [
              {
                personId: 579266,
                lastName: 'CASSORIA',
                firstName: 'YRUDYPETER',
                dateOfBirth: '1980-07-20',
                leadVisitor: true,
                relationship: 'Probation Officer',
              },
            ],
            visitDetails: {
              startTime: '2020-06-25T13:30:00',
              endTime: '2020-06-25T16:00:00',
              eventOutcomeDescription: 'Attended',
            },
          },
        ],
        pageable: {
          sort: {},
          offset: 0,
          pageNumber: 0,
          pageSize,
          paged: true,
          unpaged: false,
        },
        totalPages: 2,
        totalElements: 4,
        last: false,
        sort: { unsorted: true, sorted: false, empty: true },
        first: true,
        number: 0,
        size: pageSize,
        numberOfElements: 2,
        empty: false,
      })
    })

    it('should request a prisoners visits with visitors with the correct params', async () => {
      req.query = {
        fromDate: '13/01/2020',
        toDate: '13/02/2020',
        visitType: 'OFFI',
      }
      await controller(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsForBookingWithVisitors' does no... Remove this comment to see the full error message
      expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
        fromDate: '2020-01-13',
        page: 0,
        paged: true,
        size: 2,
        toDate: '2020-02-13',
        visitType: 'OFFI',
      })
    })

    it('should render the correct template with the correctly formatted and ordered data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerVisits/prisonerVisits.njk', {
        breadcrumbPrisonerName: 'Name, Prisoner',
        formValues: {},
        offenderNo: 'ABC123',
        pagination: {
          classes: 'govuk-!-font-size-19',
          items: [
            {
              href: 'http://localhosthttp//localhost?page=0',
              selected: true,
              text: 1,
            },
            {
              href: 'http://localhosthttp//localhost?page=1',
              selected: false,
              text: 2,
            },
          ],
          next: {
            href: 'http://localhosthttp//localhost?page=1',
            text: 'Next',
          },
          previous: false,
          results: {
            count: 4,
            from: 1,
            to: 2,
          },
        },
        prisonerName: 'Prisoner Name',
        results: [
          {
            age: 'Not entered',
            date: '2020-08-21T09:00:00',
            isFirst: true,
            isLast: true,
            name: 'Bloby Blob (lead visitor)',
            relationship: 'Brother',
            status: 'Cancelled: Operational Reasons-All Visits Cancelled',
          },
          {
            age: moment().diff('2008-01-01', 'years').toString(),
            date: '2020-08-01T13:30:00',
            isFirst: true,
            isLast: true,
            name: 'John Smith (lead visitor)',
            relationship: 'Grandson',
            status: 'Absence',
          },
          {
            age: 'Not entered',
            date: '2020-07-22T09:00:00',
            isFirst: true,
            isLast: false,
            name: 'Alvrulemeka Victetris (lead visitor)',
            relationship: 'Other - Social',
            status: 'Absence',
          },
          {
            age: moment().diff('1970-04-21', 'years').toString(),
            date: '2020-07-22T09:00:00',
            isFirst: false,
            isLast: false,
            name: 'Dom Bull ',
            relationship: 'Cousin',
            status: 'Absence',
          },
          {
            age: 'Not entered',
            date: '2020-07-22T09:00:00',
            isFirst: false,
            isLast: true,
            name: 'Bloby Blob ',
            relationship: 'Brother',
            status: 'Absence',
          },
          {
            age: moment().diff('1980-07-20', 'years').toString(),
            date: '2020-06-25T13:30:00',
            isFirst: true,
            isLast: true,
            name: 'Yrudypeter Cassoria (lead visitor)',
            relationship: 'Probation Officer',
            status: 'Attended',
          },
        ],
        visitTypes: false,
      })
    })
  })

  describe('Errors', () => {
    it('should render the error template with a link to the homepage if there is a problem retrieving prisoner details', async () => {
      const error = new Error('Network error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123')
    })

    it('should render the error template with a link to the prisoner profile if there is a problem retrieving visits', async () => {
      const error = new Error('Network error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getVisitsForBookingWithVisitors' does no... Remove this comment to see the full error message
      prisonApi.getVisitsForBookingWithVisitors.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123')
    })
  })
})
