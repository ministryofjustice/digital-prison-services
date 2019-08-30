Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const elite2api = {}
const config = require('../config')
const { displayCloseAlertForm, handleCloseAlertForm } = require('../controllers/alert').alertFactory(elite2api)

config.app.notmEndpointUrl = '//newNomisEndPointUrl/'

describe('alert management', () => {
  const res = { render: jest.fn(), redirect: jest.fn(), locals: {} }
  const mockReq = { flash: jest.fn(), body: {} }
  const bookingId = '1234'

  beforeEach(() => {
    elite2api.getDetails = jest.fn().mockReturnValue({ bookingId })
  })

  afterEach(() => {
    elite2api.getDetails.mockRestore()
  })

  describe('displayCloseAlertForm()', () => {
    beforeEach(() => {
      elite2api.getAlert = jest.fn().mockReturnValue({
        alertId: 1,
        alertType: 'L',
        alertTypeDescription: 'Care Leaver',
        alertCode: 'LFC21',
        alertCodeDescription: 'Former Relevant Child (under 21)',
        comment: 'A comment',
        dateCreated: '2019-08-23',
        expired: false,
        active: false,
      })
    })

    it('should render the closeAlertForm with the correctly formatted information', async () => {
      const req = { ...mockReq, query: { offenderNo: 'ABC123', alertId: 1 } }

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
        offenderNo: 'ABC123',
        title: 'Close alert',
      })
    })
  })

  describe('handleCloseAlertForm()', () => {
    beforeEach(() => {
      elite2api.updateAlert = jest.fn()
    })

    describe('when an option IS NOT selected', () => {
      const req = { ...mockReq, params: { offenderNo: 'ABC123', alertId: 1 } }

      it('should display an error if no option is selected', async () => {
        await handleCloseAlertForm(req, res)

        expect(req.flash).toBeCalledWith('errors', [
          { href: '#alertStatus', text: 'Select yes if you want to close this alert' },
        ])
        expect(res.redirect).toBeCalledWith('back')
      })
    })

    describe('when yes is selected', () => {
      const req = { ...mockReq, params: { offenderNo: 'ABC123', alertId: 1 }, body: { alertStatus: 'yes' } }

      it('should update the alert to INACTIVE and set the expiry date to the current date, then redirect back to the offender alerts page', async () => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
        await handleCloseAlertForm(req, res)

        expect(elite2api.getDetails).toBeCalledWith(res.locals, req.params.offenderNo)
        expect(elite2api.updateAlert).toBeCalledWith(res.locals, bookingId, req.params.alertId, {
          alertStatus: 'INACTIVE',
          expiryDate: '2019-03-29',
        })
        expect(res.redirect).toBeCalledWith(`//newNomisEndPointUrl/offenders/${req.params.offenderNo}/alerts`)

        Date.now.mockRestore()
      })
    })

    describe('when no is selected', () => {
      const req = { ...mockReq, params: { offenderNo: 'ABC123', alertId: 1 }, body: { alertStatus: 'no' } }

      it('should not update the alert, then redirect back to the offender alerts page', async () => {
        await handleCloseAlertForm(req, res)

        expect(elite2api.getDetails).not.toBeCalled()
        expect(elite2api.updateAlert).not.toBeCalled()
        expect(res.redirect).toBeCalledWith(`//newNomisEndPointUrl/offenders/${req.params.offenderNo}/alerts`)
      })
    })
  })
})
