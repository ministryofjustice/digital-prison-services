Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2api = {}
const oauthApi = {}
const config = require('../config')
const { logError } = require('../logError')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')
const { displayCloseAlertPage, handleCloseAlertForm } = require('../controllers/alert').alertFactory(
  oauthApi,
  elite2api
)

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))
config.app.notmEndpointUrl = '//newNomisEndPointUrl/'

describe('alert management', () => {
  const res = { render: jest.fn(), redirect: jest.fn(), locals: {} }
  const mockReq = { flash: jest.fn().mockReturnValue([]), originalUrl: '/close-alert/', get: jest.fn(), body: {} }
  const getDetailsResponse = { bookingId: 1234, firstName: 'Test', lastName: 'User' }
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

        await displayCloseAlertPage(req, res)

        expect(res.render).toBeCalledWith('editAlertForm.njk', {
          title: 'Close alert - Digital Prison Services',
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

        await displayCloseAlertPage(req, res)

        expect(res.render).toBeCalledWith(
          'editAlertForm.njk',
          expect.objectContaining({
            errors: [{ text: 'This alert has already expired' }],
          })
        )
      })
    })

    it.skip('should render the closeAlertForm with the correctly formatted information', async () => {
      elite2api.getAlert = jest.fn().mockReturnValueOnce({ ...alert, expired: false })

      const req = { ...mockReq, query: { offenderNo, alertId: 1 } }

      await displayCloseAlertPage(req, res)

      expect(res.render).toBeCalledWith('editAlertForm.njk', {
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

        await handleCloseAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [{ text: 'Sorry, the service is unavailable' }])
        expect(res.redirect).toBeCalledWith('back')
      })

      it('should return an error if no option is selected', async () => {
        const req = {
          ...mockReq,
          params: { offenderNo, alertId: 1 },
          body: { offenderNo, comment: 'test' },
        }

        await handleCloseAlertForm(req, res)

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

        await handleCloseAlertForm(req, res)
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

        await handleCloseAlertForm(req, res)

        expect(req.flash).toBeCalledWith('comment', 'test')
        expect(res.redirect).toBeCalledWith('back')
      })

      it('should validate missing comment', async () => {
        const req = {
          ...mockReq,
          params: { offenderNo, alertId: 1 },
          body: { offenderNo, alertStatus: 'yes' },
        }

        await handleCloseAlertForm(req, res)
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
        await handleCloseAlertForm(req, res)

        expect(elite2api.updateAlert).toBeCalledWith(res.locals, getDetailsResponse.bookingId, req.params.alertId, {
          expiryDate: '2019-03-29',
          comment: 'test',
        })

        expect(raiseAnalyticsEvent).toBeCalledWith('Alert Closed', 'Alert closed for LEI', 'Alert type - LFC21')

        expect(res.redirect).toBeCalledWith('//newNomisEndPointUrl/offenders/ABC123/alerts?alertStatus=closed')

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

        await handleCloseAlertForm(req, res)

        expect(elite2api.updateAlert).toBeCalledWith({}, '1234', 1, { comment: 'test', expiryDate: '2019-03-29' })

        expect(res.redirect).toBeCalledWith(
          `//newNomisEndPointUrl/offenders/${req.body.offenderNo}/alerts?alertStatus=closed`
        )

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
        await handleCloseAlertForm(req, res)

        expect(elite2api.updateAlert).toBeCalledWith({}, '1234', 1, { comment: 'test' })
        expect(res.redirect).toBeCalledWith(
          `//newNomisEndPointUrl/offenders/${req.body.offenderNo}/alerts?alertStatus=open`
        )
      })

      it('should raise an analytics even changes to the comment have been made', async () => {
        await handleCloseAlertForm(req, res)

        expect(raiseAnalyticsEvent).toBeCalledWith(
          'Alert comment updated',
          'Alert comment updated for ALI',
          'Alert type - LFC21'
        )
      })
    })
  })
})
