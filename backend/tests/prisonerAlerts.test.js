const prisonerAlerts = require('../controllers/prisonerProfile/prisonerAlerts')
const { serviceUnavailableMessage } = require('../common-messages')

describe('prisoner personal', () => {
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
  const prisonerProfileService = {}

  let req
  let res
  let logError
  let controller

  beforeEach(() => {
    req = { params: { offenderNo } }
    res = { locals: {}, render: jest.fn() }

    logError = jest.fn()

    req.originalUrl = 'http://localhost'

    prisonerProfileService.getPrisonerProfileData = jest.fn().mockResolvedValue(prisonerProfileData)

    elite2Api.getDetails = jest.fn().mockResolvedValue({})
    elite2Api.getAlertsForBooking = jest.fn().mockResolvedValue([])
    controller = prisonerAlerts({ prisonerProfileService, elite2Api, logError })
  })

  it('should make a call for the prisoner alerts and the prisoner header details and render them', async () => {
    elite2Api.getDetails.mockResolvedValue({ bookingId })
    await controller(req, res)

    expect(elite2Api.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(elite2Api.getAlertsForBooking).toHaveBeenCalledWith(res.locals, bookingId)
    expect(prisonerProfileService.getPrisonerProfileData).toHaveBeenCalledWith(res.locals, offenderNo)
    expect(res.render).toHaveBeenCalledWith(
      'prisonerProfile/prisonerAlerts.njk',
      expect.objectContaining({
        prisonerProfileData,
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
      await controller(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'prisonerProfile/prisonerAlerts.njk',
        expect.objectContaining({
          activeAlerts: [
            [
              { text: 'Security' },
              { text: 'Risk to females' },
              { text: 'has a large poster on cell wall' },
              { text: '20/08/2019' },
              { text: 'Smith, John' },
              {
                html:
                  '<a class="govuk-button-secondary" href="/edit-alert?offenderNo=G3878UK&alertId=1">Edit or close</a>',
              },
            ],
          ],
          inactiveAlerts: [
            [
              { text: 'Security' },
              { text: 'Risk to females' },
              { text: 'has a large poster on cell wall' },
              { html: '20/08/2019<br>21/08/2019' },
              { html: 'Smith, John<br>Smith, John' },
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
        'http://localhost',
        new Error('Problem retrieving alerts'),
        serviceUnavailableMessage
      )
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/prisoner/G3878UK/alerts' })
    })
  })
})
