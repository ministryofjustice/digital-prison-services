const prisonerChangeIncentiveLevelDetails = require('../controllers/prisonerProfile/prisonerChangeIncentiveLevelDetails')
const { serviceUnavailableMessage } = require('../common-messages')
const { raiseAnalyticsEvent } = require('../raiseAnalyticsEvent')

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Prisoner change incentive level details', () => {
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
    }
    res = { locals: { user: { allCaseloads: [] } }, render: jest.fn(), redirect: jest.fn() }

    logError = jest.fn()

    prisonApi.getDetails = jest
      .fn()
      .mockResolvedValue({ agencyId: 'MDI', bookingId, firstName: 'John', lastName: 'Smith' })
    prisonApi.getIepSummaryForBooking = jest.fn().mockReturnValue({
      bookingId: -1,
      iepDate: '2017-08-15',
      iepTime: '2017-08-15T16:04:35',
      iepLevel: 'Standard',
      daysSinceReview: 625,
      iepDetails: [
        {
          bookingId: -1,
          iepDate: '2017-08-15',
          iepTime: '2017-08-15T16:04:35',
          agencyId: 'LEI',
          iepLevel: 'Standard',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-10',
          iepTime: '2017-08-10T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Basic',
          userId: 'ITAG_USER',
        },
        {
          bookingId: -1,
          iepDate: '2017-08-07',
          iepTime: '2017-08-07T16:04:35',
          agencyId: 'HEI',
          iepLevel: 'Enhanced',
          userId: 'ITAG_USER',
        },
      ],
    })
    prisonApi.getAgencyIepLevels = jest
      .fn()
      .mockReturnValue([
        { iepLevel: 'ENT', iepDescription: 'Entry' },
        { iepLevel: 'BAS', iepDescription: 'Basic' },
        { iepLevel: 'STD', iepDescription: 'Standard' },
        { iepLevel: 'ENH', iepDescription: 'Enhanced' },
      ])
    prisonApi.changeIepLevel = jest.fn()

    controller = prisonerChangeIncentiveLevelDetails({ prisonApi, logError })
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)

        expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        expect(prisonApi.getIepSummaryForBooking).toHaveBeenCalledWith(res.locals, bookingId, true)
        expect(prisonApi.getAgencyIepLevels).toHaveBeenCalledWith(res.locals, 'MDI')
        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
          agencyId: 'MDI',
          bookingId: '123',
          breadcrumbPrisonerName: 'Smith, John',
          dpsUrl: 'http://localhost:3000/',
          formValues: {},
          iepLevel: 'Standard',
          offenderNo: 'ABC123',
          prisonerName: 'John Smith',
          profileUrl: '/prisoner/ABC123',
          selectableLevels: [
            {
              checked: false,
              text: 'Basic',
              value: 'BAS',
            },
            {
              checked: false,
              text: 'Enhanced',
              value: 'ENH',
            },
            {
              checked: false,
              text: 'Entry',
              value: 'ENT',
            },
          ],
        })
      })
    })

    describe('when there are API errors', () => {
      beforeEach(() => {
        prisonApi.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))
      })

      it('should render the error template', async () => {
        await controller.index(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `/prisoner/${offenderNo}` })
      })
    })
  })

  describe('post', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        prisonApi.changeIepLevel = jest.fn().mockReturnValue('All good')
      })

      it('should submit the appointment with the correct details and redirect', async () => {
        req.body = {
          agencyId: 'MDI',
          bookingId,
          iepLevel: 'Standard',
          newIepLevel: 'Enhanced',
          reason: 'A reason why it has changed',
        }

        await controller.post(req, res)

        expect(prisonApi.changeIepLevel).toHaveBeenCalledWith(res.locals, bookingId, {
          iepLevel: 'Enhanced',
          comment: 'A reason why it has changed',
        })
        expect(raiseAnalyticsEvent).toBeCalledWith(
          'Update Incentive level',
          'Level changed from Standard to Enhanced at MDI',
          'Incentive level change'
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${offenderNo}/incentive-level-details`)
      })
    })

    describe('when there are form errors', () => {
      it('should re render the template and return the errors', async () => {
        req.body = {}

        await controller.post(req, res)

        expect(prisonApi.changeIepLevel).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
          agencyId: 'MDI',
          bookingId: '123',
          breadcrumbPrisonerName: 'Smith, John',
          dpsUrl: 'http://localhost:3000/',
          errors: [
            {
              href: '#newIepLevel',
              text: 'Select a level',
            },
            {
              href: '#reason',
              text: 'Enter reason for incentive level change',
            },
          ],
          formValues: {},
          iepLevel: 'Standard',
          offenderNo: 'ABC123',
          prisonerName: 'John Smith',
          profileUrl: '/prisoner/ABC123',
          selectableLevels: [
            {
              checked: false,
              text: 'Basic',
              value: 'BAS',
            },
            {
              checked: false,
              text: 'Enhanced',
              value: 'ENH',
            },
            {
              checked: false,
              text: 'Entry',
              value: 'ENT',
            },
          ],
        })
      })

      it('should retain inputted form values', async () => {
        req.body = { reason: 'A reason why it has changed' }

        await controller.post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerChangeIncentiveLevelDetails.njk',
          expect.objectContaining({
            errors: [
              {
                href: '#newIepLevel',
                text: 'Select a level',
              },
            ],
            formValues: { reason: 'A reason why it has changed' },
          })
        )
      })
    })

    describe('when there are API errors', () => {
      it('should render the error template', async () => {
        req.body = { newIepLevel: 'Enhanced', reason: 'A reason why it has changed', bookingId }
        prisonApi.changeIepLevel.mockImplementation(() => Promise.reject(new Error('Network error')))

        await controller.post(req, res)

        expect(logError).toHaveBeenCalledWith('http://localhost', new Error('Network error'), serviceUnavailableMessage)
        expect(res.render).toHaveBeenCalledWith('error.njk', { url: `/prisoner/${offenderNo}` })
      })
    })
  })
})
