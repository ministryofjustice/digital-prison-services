import moment from 'moment'
import prisonerVisits from '../controllers/prisonerProfile/prisonerVisits'

describe('Prisoner visits', () => {
  const pageSize = 2
  const offenderNo = 'ABC123'
  const bookingId = '123'
  const prisonApi = {
    getDetails: jest.fn(),
    getVisitsPrisons: jest.fn(),
    getVisitsForBookingWithVisitors: jest.fn(),
    getVisitCancellationReasons: jest.fn(),
    getVisitCompletionReasons: jest.fn(),
  }

  let req
  let res
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

    controller = prisonerVisits({ prisonApi, pageSize })
    prisonApi.getDetails.mockResolvedValue({ bookingId })
    prisonApi.getVisitsPrisons.mockResolvedValue([
      { prisonId: 'HLI', prison: 'Hull' },
      { prisonId: 'MDI', prison: 'Moorland' },
    ])
    prisonApi.getVisitsForBookingWithVisitors.mockResolvedValue({
      pageable: {
        offset: {},
        pageNumber: {},
      },
    })
    prisonApi.getVisitCancellationReasons.mockResolvedValue([
      { code: 'ADMIN', description: 'Administrative Cancellation' },
      { code: 'HMP', description: 'Operational Reasons-All Visits Cancelled', listSeq: 99 },
      { code: 'NO_ID', description: 'No Identification - Refused Entry' },
    ])
    prisonApi.getVisitCompletionReasons.mockResolvedValue([
      { code: 'CANC', description: 'Cancelled' },
      { code: 'HMPOP', description: 'Terminated By Staff' },
      { code: 'SCH', description: 'Scheduled' },
      { code: 'NORM', description: 'Normal Completion', listSeq: 99 },
    ])
  })

  afterEach(() => {
    prisonApi.getDetails.mockReset()
    prisonApi.getVisitsPrisons.mockReset()
    prisonApi.getVisitsForBookingWithVisitors.mockReset()
    prisonApi.getVisitCancellationReasons.mockReset()
    prisonApi.getVisitCompletionReasons.mockReset()
  })

  it('should get the prisoner details and visits prisons', async () => {
    await controller(req, res)

    expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(prisonApi.getVisitsPrisons).toHaveBeenCalledWith(res.locals, bookingId)
  })

  describe('Visits results', () => {
    beforeEach(() => {
      prisonApi.getDetails.mockResolvedValue({ bookingId, firstName: 'Prisoner', lastName: 'Name' })
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
              { personId: 4729490, lastName: 'Dally', firstName: 'ALAN', leadVisitor: false, relationship: 'Brother' },
              { personId: 4729490, lastName: 'CALUM', firstName: 'DOTTY', leadVisitor: false, relationship: 'Brother' },
              { personId: 4729491, lastName: 'BLOB', firstName: 'BLOBY', leadVisitor: false, relationship: 'Brother' },
              {
                personId: 4729489,
                lastName: 'BULL',
                firstName: 'DOM',
                dateOfBirth: '1970-04-21',
                leadVisitor: false,
                relationship: 'Cousin',
              },
              {
                personId: 4729489,
                lastName: 'ANDREWS',
                firstName: 'DEREK',
                dateOfBirth: '1971-04-21',
                leadVisitor: false,
                relationship: 'Cousin',
              },
            ],
            visitDetails: {
              startTime: '2020-07-22T09:00:00',
              endTime: '2020-07-22T11:45:00',
              eventOutcomeDescription: 'Absence',
              visitTypeDescription: 'Official Visit',
              prison: 'Leeds (HMP)',
              completionStatus: 'SCH',
              completionStatusDescription: 'Scheduled',
            },
          },
          {
            visitors: [
              { personId: 4729491, lastName: 'BLOB', firstName: 'BLOBY', leadVisitor: true, relationship: 'Brother' },
              {
                personId: 12345,
                lastName: 'SMITH',
                firstName: 'Jenny',
                dateOfBirth: moment().subtract(1, 'years').format('YYYY-MM-DD'),
                leadVisitor: false,
                relationship: 'Granddaughter',
              },
              {
                personId: 12345,
                lastName: 'SMITH',
                firstName: 'Henry',
                dateOfBirth: moment().subtract(5, 'months').format('YYYY-MM-DD'),
                leadVisitor: false,
                relationship: 'Granddaughter',
              },
              {
                personId: 12345,
                lastName: 'SMITH',
                firstName: 'Henrrietta',
                dateOfBirth: moment().subtract(1, 'months').format('YYYY-MM-DD'),
                leadVisitor: false,
                relationship: 'Granddaughter',
              },
              {
                personId: 12345,
                lastName: 'SMITH',
                firstName: 'Freddy',
                dateOfBirth: moment().subtract(5, 'days').format('YYYY-MM-DD'),
                leadVisitor: false,
                relationship: 'Granddaughter',
              },
              {
                personId: 12345,
                lastName: 'SMITH',
                firstName: 'Fredderica',
                dateOfBirth: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                leadVisitor: false,
                relationship: 'Granddaughter',
              },
            ],
            visitDetails: {
              startTime: '2020-08-21T09:00:00',
              endTime: '2020-08-21T11:45:00',
              eventOutcomeDescription: 'Attended',
              eventStatus: 'CANC',
              eventStatusDescription: 'Cancelled',
              cancelReasonDescription: 'Operational Reasons-All Visits Cancelled',
              visitTypeDescription: 'Social Contact',
              prison: 'Leeds (HMP)',
              completionStatus: 'CANC',
              completionStatusDescription: 'Cancelled',
            },
          },
          {
            visitors: [
              {
                personId: 4729490,
                lastName: 'SMITH',
                firstName: 'JOHN',
                dateOfBirth: moment().subtract(8, 'years').format('YYYY-MM-DD'),
                leadVisitor: true, // lead visitor but under 18 so lead is ignored
                relationship: 'Grandson',
              },
              {
                personId: 12345,
                lastName: 'SMITH',
                firstName: 'James',
                dateOfBirth: moment().subtract(16, 'years').format('YYYY-MM-DD'),
                leadVisitor: false,
                relationship: 'Grandson',
              },
            ],
            visitDetails: {
              startTime: '2020-08-01T13:30:00',
              endTime: '2020-08-01T16:00:00',
              eventOutcomeDescription: 'Absence',
              visitTypeDescription: 'Official Visit',
              prison: 'Leeds (HMP)',
              completionStatus: 'CANC',
              completionStatusDescription: 'Cancelled',
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
              visitTypeDescription: 'Official Visit',
              prison: 'Leeds (HMP)',
              completionStatus: 'VDE',
              completionStatusDescription: 'Visitor Declined Entry',
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

    describe('should request a prisoners visits with visitors with the correct params', () => {
      const now = moment()
      const pageArgs = { page: 0, paged: true, size: 2 }
      it('from date and to date specified', async () => {
        req.query = {
          fromDate: '13/01/2020',
          toDate: '13/02/2020',
          visitType: 'OFFI',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          fromDate: '2020-01-13',
          toDate: '2020-02-13',
          visitType: 'OFFI',
          ...pageArgs,
        })
      })
      it('scheduled status specified', async () => {
        req.query = {
          status: 'SCH',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          fromDate: now.format('YYYY-MM-DD'),
          visitStatus: 'SCH',
          ...pageArgs,
        })
      })
      it('scheduled status specified with from date in past', async () => {
        req.query = {
          status: 'SCH',
          fromDate: '13/01/2020',
          toDate: '13/02/2020',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          fromDate: now.format('YYYY-MM-DD'),
          toDate: '2020-02-13',
          visitStatus: 'SCH',
          ...pageArgs,
        })
      })
      it('scheduled status specified with from date in future', async () => {
        req.query = {
          status: 'SCH',
          fromDate: now.add('1w').format('DD/MM/YYYY'),
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          fromDate: now.add('1w').format('YYYY-MM-DD'),
          visitStatus: 'SCH',
          ...pageArgs,
        })
      })
      it('expired status specified', async () => {
        req.query = {
          status: 'EXP',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          toDate: now.format('YYYY-MM-DD'),
          visitStatus: 'SCH',
          ...pageArgs,
        })
      })
      it('expired status specified with to date in past', async () => {
        req.query = {
          status: 'EXP',
          fromDate: '13/01/2020',
          toDate: '13/02/2020',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          toDate: '2020-02-13',
          fromDate: '2020-01-13',
          visitStatus: 'SCH',
          ...pageArgs,
        })
      })
      it('expired status specified with to date in future', async () => {
        req.query = {
          status: 'EXP',
          toDate: now.add('1w').format('DD/MM/YYYY'),
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          toDate: now.add('1w').format('YYYY-MM-DD'),
          visitStatus: 'SCH',
          ...pageArgs,
        })
      })
      it('completion status specified', async () => {
        req.query = {
          status: 'COMP',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          visitStatus: 'COMP',
          ...pageArgs,
        })
      })
      it('cancel status specified', async () => {
        req.query = {
          status: 'CANC-NSHOW',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          visitStatus: 'CANC',
          cancellationReason: 'NSHOW',
          ...pageArgs,
        })
      })
      it('all fields specified as empty strings', async () => {
        req.query = {
          toDate: '',
          fromDate: '',
          visitType: '',
          status: '',
          establishment: '',
        }
        await controller(req, res)

        expect(prisonApi.getVisitsForBookingWithVisitors).toHaveBeenCalledWith(res.locals, bookingId, {
          prisonId: '',
          visitStatus: '',
          visitType: '',
          ...pageArgs,
        })
      })
    })

    it('should render the correct template with the correctly formatted and ordered data', async () => {
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerVisits/prisonerVisits.njk', {
        breadcrumbPrisonerName: 'Name, Prisoner',
        formValues: {},
        offenderNo: 'ABC123',
        filterApplied: false,
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
            date: '2020-08-21T09:00:00',
            time: '09:00 to 11:45',
            type: 'Social',
            isFirst: true,
            isLast: false,
            nameWithChildAge: 'Bloby Blob',
            lastAdult: true,
            relationship: 'Brother',
            status: 'Cancelled',
            subStatus: 'Operational Reasons-All Visits Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-21T09:00:00',
            time: '09:00 to 11:45',
            type: 'Social',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Children:',
            lastAdult: false,
            relationship: '',
            status: 'Cancelled',
            subStatus: 'Operational Reasons-All Visits Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-21T09:00:00',
            time: '09:00 to 11:45',
            type: 'Social',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Jenny Smith - 1 year old',
            lastAdult: false,
            relationship: 'Granddaughter',
            status: 'Cancelled',
            subStatus: 'Operational Reasons-All Visits Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-21T09:00:00',
            time: '09:00 to 11:45',
            type: 'Social',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Henry Smith - 5 months old',
            lastAdult: false,
            relationship: 'Granddaughter',
            status: 'Cancelled',
            subStatus: 'Operational Reasons-All Visits Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-21T09:00:00',
            time: '09:00 to 11:45',
            type: 'Social',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Henrrietta Smith - 1 month old',
            lastAdult: false,
            relationship: 'Granddaughter',
            status: 'Cancelled',
            subStatus: 'Operational Reasons-All Visits Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-21T09:00:00',
            time: '09:00 to 11:45',
            type: 'Social',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Freddy Smith - 5 days old',
            lastAdult: false,
            relationship: 'Granddaughter',
            status: 'Cancelled',
            subStatus: 'Operational Reasons-All Visits Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-21T09:00:00',
            time: '09:00 to 11:45',
            type: 'Social',
            isFirst: false,
            isLast: true,
            nameWithChildAge: 'Fredderica Smith - 1 day old',
            lastAdult: false,
            relationship: 'Granddaughter',
            status: 'Cancelled',
            subStatus: 'Operational Reasons-All Visits Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-01T13:30:00',
            time: '13:30 to 16:00',
            type: 'Official',
            isFirst: true,
            isLast: false,
            nameWithChildAge: 'Children:',
            lastAdult: false,
            relationship: '',
            status: 'Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-01T13:30:00',
            time: '13:30 to 16:00',
            type: 'Official',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'James Smith - 16 years old',
            lastAdult: false,
            relationship: 'Grandson',
            status: 'Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-08-01T13:30:00',
            time: '13:30 to 16:00',
            type: 'Official',
            isFirst: false,
            isLast: true,
            nameWithChildAge: 'John Smith - 8 years old',
            lastAdult: false,
            relationship: 'Grandson',
            status: 'Cancelled',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-07-22T09:00:00',
            time: '09:00 to 11:45',
            type: 'Official',
            isFirst: true,
            isLast: false,
            nameWithChildAge: 'Alvrulemeka Victetris',
            lastAdult: false,
            relationship: 'Other - Social',
            status: 'Not entered',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-07-22T09:00:00',
            time: '09:00 to 11:45',
            type: 'Official',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Dom Bull',
            lastAdult: false,
            relationship: 'Cousin',
            status: 'Not entered',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-07-22T09:00:00',
            time: '09:00 to 11:45',
            type: 'Official',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Derek Andrews',
            lastAdult: false,
            relationship: 'Cousin',
            status: 'Not entered',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-07-22T09:00:00',
            time: '09:00 to 11:45',
            type: 'Official',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Bloby Blob',
            lastAdult: false,
            relationship: 'Brother',
            status: 'Not entered',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-07-22T09:00:00',
            time: '09:00 to 11:45',
            type: 'Official',
            isFirst: false,
            isLast: false,
            nameWithChildAge: 'Dotty Calum',
            lastAdult: false,
            relationship: 'Brother',
            status: 'Not entered',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-07-22T09:00:00',
            time: '09:00 to 11:45',
            type: 'Official',
            isFirst: false,
            isLast: true,
            nameWithChildAge: 'Alan Dally',
            lastAdult: false,
            relationship: 'Brother',
            status: 'Not entered',
            prison: 'Leeds (HMP)',
          },
          {
            date: '2020-06-25T13:30:00',
            time: '13:30 to 16:00',
            type: 'Official',
            isFirst: true,
            isLast: true,
            nameWithChildAge: 'Yrudypeter Cassoria',
            lastAdult: false,
            relationship: 'Probation Officer',
            status: 'Visitor Declined Entry',
            prison: 'Leeds (HMP)',
          },
        ],
        visitTypes: [
          { value: 'SCON', text: 'Social' },
          { value: 'OFFI', text: 'Official' },
        ],
        prisons: [
          { value: 'HLI', text: 'Hull' },
          { value: 'MDI', text: 'Moorland' },
        ],
        statuses: [
          { value: 'CANC-HMP', text: 'Cancelled: Operational Reasons-All Visits Cancelled' },
          { value: 'CANC-ADMIN', text: 'Cancelled: Administrative Cancellation' },
          { value: 'CANC-NO_ID', text: 'Cancelled: No Identification - Refused Entry' },
          { value: 'NORM', text: 'Normal Completion' },
          { value: 'HMPOP', text: 'Terminated By Staff' },
          { value: 'SCH', text: 'Scheduled' },
          { value: 'EXP', text: 'Not entered' },
        ],
        profileUrl: '/prisoner/ABC123',
      })
    })
  })

  describe('Errors', () => {
    it('should render the error template with a link to the homepage if there is a problem retrieving prisoner details', async () => {
      const error = new Error('Network error')
      prisonApi.getDetails.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123')
    })

    it('should render the error template with a link to the prisoner profile if there is a problem retrieving visits', async () => {
      const error = new Error('Network error')
      prisonApi.getVisitsForBookingWithVisitors.mockImplementation(() => Promise.reject(error))

      await expect(controller(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123')
    })
  })
})
