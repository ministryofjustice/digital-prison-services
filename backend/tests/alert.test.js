Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const moment = require('moment')

const elite2api = {}
const oauthApi = {}
const referenceCodesService = {}
const config = require('../config')
const { logError } = require('../logError')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')
const {
  handleCreateAlertForm,
  displayCreateAlertPage,
  displayEditAlertPage,
  handleEditAlertForm,
} = require('../controllers/alert').alertFactory(oauthApi, elite2api, referenceCodesService)

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))
config.app.notmEndpointUrl = '//newNomisEndPointUrl/'

describe('alert management', () => {
  let mockReq
  let res

  const mockCreateReq = {
    flash: jest.fn().mockReturnValue([]),
    originalUrl: '/create-alert/',
    get: jest.fn(),
    body: {},
  }
  const getDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
    agencyId: 'AKI',
    alerts: [
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
        dateExpires: null,
        expired: false,
        expiredByFirstName: 'John',
        expiredByLastName: 'Smith',
        offenderNo: 'G3878UK',
      },
    ],
  }
  const alert = {
    alertId: 1,
    alertType: 'L',
    alertTypeDescription: 'Care Leaver',
    alertCode: 'LFC21',
    alertCodeDescription: 'Former Relevant Child (under 21)',
    comment: 'A comment',
    dateCreated: '2019-08-23',
    active: false,
    addedByFirstName: 'first name',
    addedByLastName: 'last name',
  }
  const offenderNo = 'ABC123'

  beforeEach(() => {
    res = { render: jest.fn(), redirect: jest.fn(), locals: {} }
    mockReq = {
      flash: jest.fn().mockReturnValue([]),
      originalUrl: '/close-alert/',
      get: jest.fn(),
      body: {},
      headers: {},
    }
    elite2api.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
    oauthApi.currentUser = jest.fn().mockReturnValue({ name: 'Test User' })
    elite2api.userCaseLoads = jest.fn().mockReturnValue([
      {
        caseLoadId: 'AKI',
        description: 'Acklington (HMP)',
        type: 'INST',
        caseloadFunction: 'GENERAL',
        currentlyActive: false,
      },
      {
        caseLoadId: 'ALI',
        description: 'Albany (HMP)',
        type: 'INST',
        caseloadFunction: 'GENERAL',
        currentlyActive: true,
      },
    ])
    oauthApi.userRoles = jest.fn().mockReturnValue([])
  })

  afterEach(() => {
    elite2api.getDetails.mockRestore()
    elite2api.userCaseLoads.mockRestore()
    mockReq.flash.mockRestore()
  })

  describe('displayCloseAlertPage()', () => {
    describe('when there are errors', () => {
      it('should return an error when there is a problem retrieving the alert', async () => {
        elite2api.getAlert = jest.fn().mockImplementationOnce(() => {
          throw new Error('There has been an error')
        })

        const req = { ...mockReq, query: { offenderNo, alertId: 1 } }

        await displayEditAlertPage(req, res)

        expect(res.render).toBeCalledWith('alerts/editAlertForm.njk', {
          errors: [{ text: 'Sorry, the service is unavailable' }],
        })
        expect(logError).toBeCalledWith(
          '/close-alert/',
          new Error('There has been an error'),
          'Sorry, the service is unavailable'
        )
      })

      it.skip('should return an error when the alert has already expired', async () => {
        elite2api.getAlert = jest.fn().mockReturnValueOnce({ ...alert, expired: true })

        const req = { ...mockReq, query: { offenderNo, alertId: 1 } }

        await displayEditAlertPage(req, res)

        expect(res.render).toBeCalledWith(
          'alerts/editAlertForm.njk',
          expect.objectContaining({
            errors: [{ text: 'This alert has already expired' }],
          })
        )
      })
    })

    it.skip('should render the closeAlertForm with the correctly formatted information', async () => {
      elite2api.getAlert = jest.fn().mockReturnValueOnce({ ...alert, expired: false })

      const req = { ...mockReq, query: { offenderNo, alertId: 1 } }

      await displayEditAlertPage(req, res)

      expect(res.render).toBeCalledWith('alerts/editAlertForm.njk', {
        alert: {
          active: false,
          alertCode: 'LFC21',
          alertCodeDescription: 'Former Relevant Child (under 21)',
          alertId: 1,
          alertType: 'L',
          alertTypeDescription: 'Care Leaver',
          comment: 'A comment',
          dateCreated: '23/08/2019',
          expired: false,
          createdBy: 'First name Last name',
        },
        caseLoadId: 'ALI',
        errors: [],
        formAction: '/api/close-alert/1234/1',
        offenderDetails: {
          bookingId: 1234,
          name: 'User, Test',
          offenderNo: 'ABC123',
          profileUrl: '//newNomisEndPointUrl/offenders/ABC123',
        },
        title: 'Close alert - Digital Prison Services',
        user: { activeCaseLoad: { description: 'Albany (HMP)' }, displayName: 'Test User' },
        userRoles: [],
      })
    })
  })

  describe('handleCloseAlertForm()', () => {
    beforeEach(() => {
      elite2api.updateAlert = jest.fn()
      elite2api.getAlert = jest.fn()
    })

    describe('when there are errors', () => {
      it('should return an error when there is a problem updating the alert', async () => {
        const req = {
          ...mockReq,
          params: { offenderNo, alertId: 1 },
          body: { alertStatus: 'yes', offenderNo, comment: 'test' },
        }

        elite2api.updateAlert = jest.fn().mockImplementationOnce(() => {
          throw new Error('There has been an error')
        })

        await handleEditAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [{ text: 'Sorry, the service is unavailable' }])
        expect(res.redirect).toBeCalledWith('back')
      })

      it('should return an error if no option is selected', async () => {
        const req = {
          ...mockReq,
          params: { offenderNo, alertId: 1 },
          body: { offenderNo, comment: 'test' },
        }

        await handleEditAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [
          { href: '#alertStatus', text: 'Select yes if you want to close this alert' },
        ])
        expect(res.redirect).toBeCalledWith('back')
      })
    })

    describe('when comment triggers validation errors', () => {
      const comment = Array.from(Array(1001).keys())
        .map(_ => 'A')
        .join('')

      it('should validate maximum length does not exceed 1000', async () => {
        const req = {
          ...mockReq,
          params: { offenderNo, alertId: 1 },
          body: { offenderNo, alertStatus: 'No', comment },
        }

        await handleEditAlertForm(req, res)
        expect(req.flash).toBeCalledWith('errors', [
          { href: '#comment', text: 'Enter a comment using 1000 characters or less' },
        ])
      })

      it('should redirect back, placing the new comment into flash so that the comment is not lost', async () => {
        const req = {
          ...mockReq,
          params: { offenderNo, alertId: 1 },
          body: { offenderNo, comment: 'test' },
        }

        await handleEditAlertForm(req, res)

        expect(req.flash).toBeCalledWith('comment', 'test')
        expect(res.redirect).toBeCalledWith('back')
      })

      it('should validate missing comment', async () => {
        const req = {
          ...mockReq,
          params: { offenderNo, alertId: 1 },
          body: { offenderNo, alertStatus: 'yes' },
        }

        await handleEditAlertForm(req, res)
        expect(req.flash).toBeCalledWith('errors', [{ href: '#comment', text: 'Comment required' }])
      })
    })

    describe('when yes is selected', () => {
      const req = {
        ...mockReq,
        params: { bookingId: 1234, alertId: 1 },
        body: { alertStatus: 'yes', offenderNo, comment: 'test' },
      }

      it('should update the alert to INACTIVE and set the expiry date to the current date, then redirect back to the offender alerts page', async () => {
        elite2api.getAlert = jest.fn().mockReturnValue({ ...alert, expired: false })
        elite2api.userCaseLoads = jest.fn().mockReturnValue([
          {
            caseLoadId: 'LEI',
            currentlyActive: true,
          },
        ])
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
        await handleEditAlertForm(req, res)

        expect(elite2api.updateAlert).toBeCalledWith(res.locals, getDetailsResponse.bookingId, req.params.alertId, {
          expiryDate: '2019-03-29',
          comment: 'test',
        })

        expect(raiseAnalyticsEvent).toBeCalledWith('Alert Closed', 'Alert closed for LEI', 'Alert type - LFC21')

        expect(res.redirect).toBeCalledWith('/prisoner/ABC123/alerts?alertStatus=closed')

        Date.now.mockRestore()
      })
    })

    describe('when yes is selected, and a comment has a value', () => {
      const req = {
        ...mockReq,
        params: { bookingId: '1234', alertId: 1 },
        body: { alertStatus: 'yes', offenderNo, comment: 'test' },
      }

      it('should update the alert comment and expiry date', async () => {
        elite2api.getAlert = jest.fn().mockReturnValueOnce({ ...alert, expired: false })
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z

        await handleEditAlertForm(req, res)

        expect(elite2api.updateAlert).toBeCalledWith({}, '1234', 1, { comment: 'test', expiryDate: '2019-03-29' })

        expect(res.redirect).toBeCalledWith(`/prisoner/${req.body.offenderNo}/alerts?alertStatus=closed`)

        Date.now.mockRestore()
      })
    })

    describe('when no is selected, and a comment has a value', () => {
      const req = {
        ...mockReq,
        params: { bookingId: '1234', alertId: 1 },
        body: { alertStatus: 'no', offenderNo, comment: 'test' },
      }

      beforeEach(() => {
        elite2api.getAlert = jest.fn().mockReturnValueOnce({ ...alert, expired: false })
        raiseAnalyticsEvent.mockRestore()
      })

      it('should update the alert comment only', async () => {
        await handleEditAlertForm(req, res)

        expect(elite2api.updateAlert).toBeCalledWith({}, '1234', 1, { comment: 'test' })
        expect(res.redirect).toBeCalledWith(`/prisoner/${req.body.offenderNo}/alerts?alertStatus=open`)
      })

      it('should raise an analytics even changes to the comment have been made', async () => {
        await handleEditAlertForm(req, res)

        expect(raiseAnalyticsEvent).toBeCalledWith(
          'Alert comment updated',
          'Alert comment updated for ALI',
          'Alert type - LFC21'
        )
      })
    })
  })

  describe('displayCreateAlertPage()', () => {
    it('should return an error when there is a problem loading the form', async () => {
      oauthApi.userRoles = jest.fn().mockImplementationOnce(() => {
        throw new Error('There has been an error')
      })

      const req = { ...mockCreateReq, params: { offenderNo }, headers: {} }

      await displayCreateAlertPage(req, res)

      expect(res.render).toBeCalledWith('error.njk', {
        url: '/prisoner/ABC123/alerts',
      })
      expect(logError).toBeCalledWith(
        '/create-alert/',
        new Error('There has been an error'),
        'Sorry, the service is unavailable'
      )
    })

    it('should render the createAlertForm with the correctly formatted information', async () => {
      referenceCodesService.getAlertTypes = jest.fn().mockImplementationOnce(() => {
        return {
          alertTypes: [
            {
              value: 'P',
              description: 'MAPP',
              activeFlag: 'Y',
            },
          ],
          alertSubTypes: [
            {
              value: 'PI',
              description: 'MAPP 1',
              activeFlag: 'Y',
              parentValue: 'P',
            },
          ],
        }
      })
      oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'UPDATE_ALERT' }])
      const req = { ...mockCreateReq, params: { offenderNo }, headers: {} }

      await displayCreateAlertPage(req, res)

      expect(res.render).toBeCalledWith('alerts/createAlertForm.njk', {
        offenderDetails: {
          bookingId: 1234,
          name: 'Test User',
          offenderNo: 'ABC123',
          profileUrl: '/prisoner/ABC123',
        },
        prisonersActiveAlertCodes: 'XC',
        offenderNo,
        homeUrl: '/prisoner/ABC123/alerts',
        alertsRootUrl: '/prisoner/ABC123/create-alert',
        bookingId: 1234,
        formValues: { effectiveDate: moment().format('DD/MM/YYYY') },
        alertTypes: [{ value: 'P', text: 'MAPP' }],
        alertCodes: [{ value: 'PI', text: 'MAPP 1' }],
      })
    })
  })

  describe('handleCreateAlertForm()', () => {
    beforeEach(() => {
      raiseAnalyticsEvent.mockRestore()
      elite2api.createAlert = jest.fn()
      referenceCodesService.getAlertTypes = jest.fn().mockImplementationOnce(() => {
        return {
          alertTypes: [
            {
              value: 'P',
              description: 'MAPP',
              activeFlag: 'Y',
            },
          ],
          alertSubTypes: [
            {
              value: 'PI',
              description: 'MAPP 1',
              activeFlag: 'Y',
              parentValue: 'P',
            },
          ],
        }
      })
    })

    describe('when there are errors', () => {
      it('should return an error when there is a problem creating the alert', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: {
            alertType: 'P',
            alertCode: 'PI',
            effectiveDate: moment().format('DD/MM/YYYY'),
            bookingId: 1234,
            offenderNo,
            comments: 'test',
          },
        }

        elite2api.createAlert = jest.fn().mockImplementationOnce(() => {
          throw new Error('There has been an error')
        })

        await handleCreateAlertForm(req, res)

        expect(res.render).toBeCalledWith('error.njk', {
          url: '/prisoner/ABC123/create-alert',
        })
      })

      it('should return an error if missing data', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: { offenderNo, comments: 'test', effectiveDate: moment().format('YYYY-MM-DD') },
        }

        await handleCreateAlertForm(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'alerts/createAlertForm.njk',
          expect.objectContaining({
            errors: [
              { href: '#alert-type', text: 'Select the type of alert' },
              { href: '#alert-code', text: 'Select the alert' },
              { href: '#effective-date', text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2020' },
            ],
          })
        )
      })

      it('should return an error if offender already has alert', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: {
            offenderNo,
            comments: 'test',
            effectiveDate: moment().format('DD/MM/YYYY'),
            alertCode: 'XC',
            alertType: 'X',
            existingAlerts: 'XC',
          },
        }

        await handleCreateAlertForm(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'alerts/createAlertForm.njk',
          expect.objectContaining({
            errors: [{ href: '#alert-code', text: 'Select an alert that does not already exist for this offender' }],
            alertCodes: [],
          })
        )
      })
    })

    describe('when comment triggers validation errors', () => {
      const comments = Array.from(Array(1001).keys())
        .map(_ => 'A')
        .join('')

      it('should validate maximum length does not exceed 1000', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: { offenderNo, comments },
        }

        await handleCreateAlertForm(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'alerts/createAlertForm.njk',
          expect.objectContaining({
            errors: [
              { href: '#alert-type', text: 'Select the type of alert' },
              { href: '#alert-code', text: 'Select the alert' },
              { href: '#comments', text: 'Enter why you are creating this alert using 1,000 characters or less' },
              { href: '#effective-date', text: 'Select when you want this alert to start' },
            ],
            alertCodes: [{ text: 'MAPP 1', value: 'PI' }],
          })
        )
      })
    })

    describe('when the form is filled correctly', () => {
      it('should submit and redirect', async () => {
        const req = {
          ...mockCreateReq,
          session: {
            userDetails: {
              activeCaseLoadId: 'MDI',
            },
          },
          params: { offenderNo },
          body: {
            alertType: 'P',
            alertCode: 'PI',
            effectiveDate: moment().format('DD/MM/YYYY'),
            bookingId: 1234,
            offenderNo,
            comments: 'test',
          },
        }

        elite2api.createAlert = jest.fn()

        await handleCreateAlertForm(req, res)

        expect(raiseAnalyticsEvent).toBeCalledWith('Alert Created', 'Alert type - PI', 'Alert created for MDI')

        expect(res.redirect).toBeCalledWith('/prisoner/ABC123/alerts')
      })
    })
  })
})
