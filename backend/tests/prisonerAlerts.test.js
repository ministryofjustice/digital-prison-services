const prisonerAlerts = require('../controllers/prisonerProfile/prisonerAlerts')
const { serviceUnavailableMessage } = require('../common-messages')

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
  const bookingId = '14'
  const elite2Api = {}
  const oauthApi = {}
  const prisonerProfileService = {}
  const referenceCodesService = {}
  const paginationService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = { params: { offenderNo }, query: {}, protocol: 'http' }
    res = { locals: { responseHeaders: { 'total-records': 0 } }, render: jest.fn() }

    logError = jest.fn()

    req.originalUrl = '/alerts'
    req.get = jest.fn()
    req.get.mockReturnValue('localhost')

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    elite2Api.getDetails = jest.fn().mockResolvedValue({})
    referenceCodesService.getAlertTypes = jest.fn().mockResolvedValue({
      alertTypes: [
        { activeFlag: 'Y', description: 'Child Communication Measures', value: 'C' },
        { activeFlag: 'Y', description: 'Social Care', value: 'A' },
      ],
    })
    paginationService.getPagination = jest.fn().mockReturnValue([])
    elite2Api.getAlertsForBooking = jest.fn().mockResolvedValue([])
    oauthApi.userRoles = jest.fn().mockResolvedValue([{ roleCode: 'UPDATE_ALERT' }])
    controller = prisonerAlerts({
      prisonerProfileService,
      referenceCodesService,
      paginationService,
      elite2Api,
      oauthApi,
      logError,
    })
  })

  it('should make a call for the prisoner alerts and the prisoner header details and render them', async () => {
    elite2Api.getDetails.mockResolvedValue({ bookingId })
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(elite2Api.getAlertsForBooking).toHaveBeenCalledWith(
      res.locals,
      {
        bookingId: '14',
        query: "?query=active:eq:'ACTIVE'",
      },
      { 'Page-Limit': 20, 'Page-Offset': 0, 'Sort-Fields': 'dateCreated', 'Sort-Order': 'DESC' }
    )
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(referenceCodesService.getAlertTypes).toHaveBeenCalledWith(res.locals)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerAlerts.njk',
      expect.objectContaining({
        prisonerProfileData,
        activeAlerts: [],
        inactiveAlerts: [],
        alertTypeValues: [{ text: 'Child Communication Measures', value: 'C' }, { text: 'Social Care', value: 'A' }],
      })
    )
  })

  it('should correctly combine filters and pass on to API call', async () => {
    elite2Api.getDetails.mockResolvedValue({ bookingId })
    req.query = {
      fromDate: '10/10/2019',
      toDate: '11/10/2019',
      alertType: 'X',
      active: 'ACTIVE',
    }

    res.locals.responseHeaders['total-records'] = 1

    paginationService.getPagination.mockReturnValue({
      classes: 'govuk-!-font-size-19',
      items: [],
      next: undefined,
      previous: undefined,
      results: { count: 1, from: 1, to: 1 },
    })
    await controller(req, res)

    expect(elite2Api.getAlertsForBooking).toHaveBeenCalledWith(
      res.locals,
      {
        bookingId: '14',
        query:
          "?query=alertType:in:'X',and:dateCreated:gteq:DATE'2019-10-10',and:dateCreated:lteq:DATE'2019-10-11',and:active:eq:'ACTIVE'",
      },
      { 'Page-Limit': 20, 'Page-Offset': 0, 'Sort-Fields': 'dateCreated', 'Sort-Order': 'DESC' }
    )
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerAlerts.njk',
      expect.objectContaining({
        prisonerProfileData,
        activeAlerts: [],
        inactiveAlerts: [],
        alertTypeValues: [{ text: 'Child Communication Measures', value: 'C' }, { text: 'Social Care', value: 'A' }],
        totalAlerts: 1,
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
      elite2Api.getDetails.mockResolvedValue({ bookingId })
      elite2Api.getAlertsForBooking.mockResolvedValue([
        {
          active: true,
          addedByFirstName: 'John',
          addedByLastName: 'Smith',
          alertCode: 'XC',
          alertCodeDescription: 'Risk to females',
          alertId: 1,
          alertType: 'X',
          alertTypeDescription: 'Security',
          bookingId: 14,
          comment: 'has a large poster on cell wall',
          dateCreated: '2019-08-20',
          dateExpires: '',
          expired: false,
          expiredByFirstName: 'John',
          expiredByLastName: 'Smith',
          offenderNo: 'G3878UK',
        },
        {
          active: false,
          addedByFirstName: 'John',
          addedByLastName: 'Smith',
          alertCode: 'XC',
          alertCodeDescription: 'Risk to females',
          alertId: 2,
          alertType: 'X',
          alertTypeDescription: 'Security',
          bookingId: 14,
          comment: 'has a large poster on cell wall',
          dateCreated: '2019-08-20',
          dateExpires: '2019-08-21',
          expired: true,
          expiredByFirstName: 'John',
          expiredByLastName: 'Smith',
          offenderNo: 'G3878UK',
        },
      ])
    })

    it('should render the alerts template with the correctly formatted data', async () => {
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
                html:
                  '<a class="govuk-button govuk-button--secondary" href="/edit-alert?offenderNo=G3878UK&alertId=1">Change or close</a>',
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
      elite2Api.getAlertsForBooking.mockRejectedValue(new Error('Problem retrieving alerts'))
      await controller(req, res)

      expect(logError).toHaveBeenCalledWith(
        '/alerts',
        new Error('Problem retrieving alerts'),
        serviceUnavailableMessage
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/prisoner/G3878UK/alerts' })
    })
  })
})
