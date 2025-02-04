import prisonerAlerts from '../controllers/prisonerProfile/prisonerAlerts'

describe('prisoner alerts', () => {
  const offenderNo = 'G3878UK'
  const prisonerProfileData = {
    activeAlertCount: 1,
    agencyName: 'Moorland Closed',
    alerts: [],
    category: 'Cat C',
    csra: 'High',
    inactiveAlertCount: 2,
    incentiveLevel: 'Standard',
    keyWorkerLastSession: '07/04/2020',
    keyWorkerName: 'Member, Staff',
    location: 'CELL-123',
    offenderName: 'Prisoner, Test',
    offenderNo,
  }
  const prisonerAlertsApi = {
    getAlertsForPrisonNumber: jest.fn(),
  }
  const oauthApi = {}
  const prisonerProfileService = {}
  const referenceCodesService = {}
  const paginationService = {}
  const restrictedPatientApi = {}
  const systemOauthClient = {
    getClientCredentialsTokens: () => ({}),
  }

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = {
      params: { offenderNo },
      query: {},
      protocol: 'http',
      session: {
        userDetails: {
          username: 'user1',
        },
      },
    }
    res = {
      locals: {
        responseHeaders: { 'total-records': 0 },

        user: { activeCaseLoad: { caseLoadId: 'MDI' } },
      },
      render: jest.fn(),
      status: jest.fn(),
    }

    logError = jest.fn()

    req.originalUrl = '/alerts'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([])

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertTypes' does not exist on type '{... Remove this comment to see the full error message
    referenceCodesService.getAlertTypes = jest.fn().mockResolvedValue({
      alertTypes: [
        { activeFlag: 'Y', description: 'Child Communication Measures', value: 'C' },
        { activeFlag: 'Y', description: 'Social Care', value: 'A' },
      ],
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPagination' does not exist on type '{... Remove this comment to see the full error message
    paginationService.getPagination = jest.fn().mockReturnValue([])
    prisonerAlertsApi.getAlertsForPrisonNumber = jest.fn().mockResolvedValue({
      content: [],
      pageable: {
        sort: {
          sorted: true,
          unsorted: false,
          empty: false,
        },
        offset: 0,
        pageSize: 20,
        pageNumber: 0,
        paged: true,
        unpaged: false,
      },
      last: true,
      totalElements: 0,
      totalPages: 0,
      size: 20,
      number: 0,
      sort: {
        sorted: true,
        unsorted: false,
        empty: false,
      },
      first: true,
      numberOfElements: 0,
      empty: false,
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'UPDATE_ALERT' }])
    controller = prisonerAlerts({
      prisonerProfileService,
      referenceCodesService,
      paginationService,
      prisonerAlertsApi,
      oauthApi,
      restrictedPatientApi,
      systemOauthClient,
      // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonerProfileService: {}; re... Remove this comment to see the full error message
      logError,
    })
  })

  it('should make a call for the prisoner alerts and the prisoner header details and render them', async () => {
    await controller(req, res)

    expect(prisonerAlertsApi.getAlertsForPrisonNumber).toHaveBeenCalledWith(
      {},
      {
        prisonNumber: 'G3878UK',
        alertType: '',
        from: '',
        to: '',
        isActive: true,
        page: 0,
        sort: 'createdAt,desc',
        size: 20,
      }
    )
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo, 'user1', false)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAlertTypes' does not exist on type '{... Remove this comment to see the full error message
    expect(referenceCodesService.getAlertTypes).toHaveBeenCalledWith({})
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerAlerts.njk',
      expect.objectContaining({
        prisonerProfileData,
        activeAlerts: [],
        inactiveAlerts: [],
        alertTypeValues: [
          { text: 'Child Communication Measures', value: 'C' },
          { text: 'Social Care', value: 'A' },
        ],
      })
    )
  })

  it('should correctly combine filters and pass on to API call', async () => {
    req.query = {
      fromDate: '10/10/2019',
      toDate: '11/10/2019',
      alertType: 'X',
      active: 'ACTIVE',
    }

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPagination' does not exist on type '{... Remove this comment to see the full error message
    paginationService.getPagination.mockReturnValue({
      classes: 'govuk-!-font-size-19',
      items: [],
      next: undefined,
      previous: undefined,
      results: { count: 1, from: 1, to: 1 },
    })
    await controller(req, res)

    expect(prisonerAlertsApi.getAlertsForPrisonNumber).toHaveBeenCalledWith(
      {},
      {
        prisonNumber: 'G3878UK',
        alertType: 'X',
        from: '2019-10-10',
        to: '2019-10-11',
        isActive: true,
        page: 0,
        sort: 'createdAt,desc',
        size: 20,
      }
    )

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo, 'user1', false)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerAlerts.njk',
      expect.objectContaining({
        prisonerProfileData,
        activeAlerts: [],
        inactiveAlerts: [],
        alertTypeValues: [
          { text: 'Child Communication Measures', value: 'C' },
          { text: 'Social Care', value: 'A' },
        ],
        totalAlerts: 0,
        alertType: 'X',
        active: 'ACTIVE',
        fromDate: '10/10/2019',
        toDate: '11/10/2019',
        pagination: {
          classes: 'govuk-!-font-size-19',
          items: [],
          next: undefined,
          previous: undefined,
          results: { count: 1, from: 1, to: 1 },
        },
      })
    )
  })

  describe('alerts', () => {
    beforeEach(() => {
      prisonerAlertsApi.getAlertsForPrisonNumber.mockResolvedValue({
        content: [
          {
            isActive: true,
            createdByDisplayName: 'John Smith',
            alertCode: {
              code: 'XC',
              description: 'Risk to females',
              alertTypeCode: 'X',
              alertTypeDescription: 'Security',
            },
            alertId: 1,
            bookingId: 14,
            description: 'has a large poster on cell wall',
            createdAt: '2019-08-20',
            activeTo: '',
            expired: false,
            activeToLastSetByDisplayName: 'John Smith',
            offenderNo: 'G3878UK',
          },
          {
            isActive: false,
            createdByDisplayName: 'John Smith',
            alertCode: {
              code: 'XC',
              description: 'Risk to females',
              alertTypeCode: 'X',
              alertTypeDescription: 'Security',
            },
            bookingId: 14,
            description: 'has a large poster on cell wall',
            createdAt: '2019-08-20',
            activeTo: '2019-08-21',
            expired: true,
            activeToLastSetByDisplayName: 'John Smith',
            offenderNo: 'G3878UK',
          },
        ],
        pageable: {
          sort: {
            sorted: true,
            unsorted: false,
            empty: false,
          },
          offset: 0,
          pageSize: 100,
          pageNumber: 0,
          paged: true,
          unpaged: false,
        },
        last: true,
        totalElements: 2,
        totalPages: 1,
        size: 20,
        number: 0,
        sort: {
          sorted: true,
          unsorted: false,
          empty: false,
        },
        first: true,
        numberOfElements: 2,
        empty: false,
      })
    })

    it('should render the alerts template with the correctly formatted data', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getPrisonerProfileData' does not exist o... Remove this comment to see the full error message
      prisonerProfileService.getPrisonerProfileData = jest
        .fn()
        .mockResolvedValue({ prisonerProfileData, userCanEdit: true })

      res.locals.responseHeaders['total-records'] = 1
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerAlerts.njk',
        expect.objectContaining({
          activeAlerts: [
            [
              { text: 'Security (X)' },
              { text: 'Risk to females (XC)' },
              { text: 'has a large poster on cell wall', classes: 'clip-overflow' },
              { text: '20 August 2019' },
              { text: 'John Smith' },
              {
                classes: 'govuk-table__cell--numeric',
                html: '<a class="govuk-button govuk-button--secondary" href="/edit-alert?offenderNo=G3878UK&alertId=1">Change or close</a>',
              },
            ],
          ],
          inactiveAlerts: [
            [
              { text: 'Security (X)' },
              { text: 'Risk to females (XC)' },
              { text: 'has a large poster on cell wall', classes: 'clip-overflow' },
              { html: '20 August 2019<br>21 August 2019' },
              { html: 'John Smith<br>John Smith' },
            ],
          ],
        })
      )
    })
  })

  describe('when there are errors with retrieving information', () => {
    it('should redirect to error page', async () => {
      const error = new Error('Problem retrieving alerts')
      prisonerAlertsApi.getAlertsForPrisonNumber.mockRejectedValue(error)

      await expect(controller(req, res)).rejects.toThrowError(error)
    })
  })
})
