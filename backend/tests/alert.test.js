Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2api = {}
const config = require('../config')
const { displayCloseAlertForm, handleCloseAlertForm } = require('../controllers/alert').alertFactory(elite2api)

config.app.notmEndpointUrl = '//newNomisEndPointUrl/'

describe('alert management', () => {
  const res = { render: jest.fn(), redirect: jest.fn(), locals: {} }
  const mockReq = { flash: jest.fn(), get: jest.fn(), body: {} }
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
  }
  const offenderNo = 'ABC123'

  beforeEach(() => {
    elite2api.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
  })

  afterEach(() => {
    elite2api.getDetails.mockRestore()
  })

  describe('displayCloseAlertForm()', () => {
    describe('when there are errors', () => {
      it('should return an error when there is a problem retrieving the alert', async () => {
        elite2api.getAlert = jest.fn().mockImplementationOnce(() => {
          throw new Error('There has been an error')
        })

        const req = { ...mockReq, query: { offenderNo, alertId: 1 } }

        await displayCloseAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [{ text: 'Sorry, the service is unavailable' }])
      })

      it('should return an error when the alert has already expired', async () => {
        elite2api.getAlert = jest.fn().mockReturnValueOnce({ ...alert, expired: true })

        const req = { ...mockReq, query: { offenderNo, alertId: 1 } }

        await displayCloseAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [{ text: 'This alert has already expired' }])
      })
    })

    it('should render the closeAlertForm with the correctly formatted information', async () => {
      elite2api.getAlert = jest.fn().mockReturnValue({ ...alert, expired: false })

      const req = { ...mockReq, query: { offenderNo, alertId: 1 } }

      await displayCloseAlertForm(req, res)

      expect(res.render).toBeCalledWith('closeAlertForm.njk', {
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
        },
        errors: undefined,
        formAction: `/api/close-alert/${getDetailsResponse.bookingId}/${req.query.alertId}`,
        offenderDetails: {
          bookingId: getDetailsResponse.bookingId,
          name: 'User, Test',
          offenderNo: req.query.offenderNo,
          profileUrl: `//newNomisEndPointUrl/offenders/${req.query.offenderNo}`,
        },
        title: 'Close alert - Digital Prison Services',
      })
    })
  })

  describe('handleCloseAlertForm()', () => {
    beforeEach(() => {
      elite2api.updateAlert = jest.fn()
    })

    describe('when there are errors', () => {
      const req = { ...mockReq, params: { offenderNo, alertId: 1 } }
      it('should return an error when there is a problem updating the alert', async () => {
        elite2api.updateAlert = jest.fn().mockImplementationOnce(() => {
          throw new Error('There has been an error')
        })

        await handleCloseAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [{ text: 'Sorry, the service is unavailable' }])
        expect(res.redirect).toBeCalledWith('back')
      })

      it('should return an error if no option is selected', async () => {
        await handleCloseAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [
          { href: '#alertStatus', text: 'Select yes if you want to close this alert' },
        ])
        expect(res.redirect).toBeCalledWith('back')
      })
    })

    describe('when yes is selected', () => {
      const req = {
        ...mockReq,
        params: { bookingId: 1234, alertId: 1 },
        body: { alertStatus: 'yes', offenderNo },
      }

      it('should update the alert to INACTIVE and set the expiry date to the current date, then redirect back to the offender alerts page', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
        await handleCloseAlertForm(req, res)

        expect(elite2api.updateAlert).toBeCalledWith(res.locals, getDetailsResponse.bookingId, req.params.alertId, {
          alertStatus: 'INACTIVE',
          expiryDate: '2019-03-29',
        })
        expect(res.redirect).toBeCalledWith(`//newNomisEndPointUrl/offenders/${req.body.offenderNo}/alerts`)

        Date.now.mockRestore()
      })
    })

    describe('when no is selected', () => {
      const req = {
        ...mockReq,
        params: { bookingId: '1234', alertId: 1 },
        body: { alertStatus: 'no', offenderNo },
      }

      it('should not update the alert, then redirect back to the offender alerts page', async () => {
        await handleCloseAlertForm(req, res)

        expect(elite2api.updateAlert).not.toBeCalled()
        expect(res.redirect).toBeCalledWith(`//newNomisEndPointUrl/offenders/${req.body.offenderNo}/alerts`)
      })
    })
  })
})
