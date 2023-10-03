import type apis from '../apis'
import type { PrisonIncentiveLevel, IepSummaryForBookingWithDetails, IepLevelChanged } from '../api/incentivesApi'
import config from '../config'
import prisonerChangeIncentiveLevelDetails from '../controllers/prisonerProfile/prisonerChangeIncentiveLevelDetails'
import { raiseAnalyticsEvent } from '../raiseAnalyticsEvent'

jest.mock('../raiseAnalyticsEvent', () => ({
  raiseAnalyticsEvent: jest.fn(),
}))

describe('Prisoner change incentive level details', () => {
  const offenderNo = 'ABC123'
  const bookingId = 123
  const prisonApi = {}
  const incentivesApi = {} as jest.Mocked<typeof apis.incentivesApi>

  const iepSummaryForBooking: IepSummaryForBookingWithDetails = {
    bookingId,
    iepDate: '2017-08-15',
    iepTime: '2017-08-15T16:04:35',
    iepLevel: 'Standard',
    daysSinceReview: 625,
    nextReviewDate: '2017-08-15',
    iepDetails: [
      {
        bookingId,
        iepDate: '2017-08-15',
        iepTime: '2017-08-15T16:04:35',
        agencyId: 'LEI',
        iepLevel: 'Standard',
        userId: 'ITAG_USER',
        comments: '3',
      },
      {
        bookingId,
        iepDate: '2017-08-10',
        iepTime: '2017-08-10T16:04:35',
        agencyId: 'HEI',
        iepLevel: 'Basic',
        userId: 'ITAG_USER',
        comments: '2',
      },
      {
        bookingId,
        iepDate: '2017-08-07',
        iepTime: '2017-08-07T16:04:35',
        agencyId: 'HEI',
        iepLevel: 'Enhanced',
        userId: 'ITAG_USER',
        comments: '1',
      },
    ],
  }
  const prisonIncentiveLevels: PrisonIncentiveLevel[] = [
    { levelCode: 'BAS', levelName: 'Basic', active: true, defaultOnAdmission: false },
    { levelCode: 'STD', levelName: 'Standard', active: true, defaultOnAdmission: true },
    { levelCode: 'ENH', levelName: 'Enhanced', active: true, defaultOnAdmission: false },
  ]

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
    res = { locals: { user: { allCaseloads: [] } }, render: jest.fn(), redirect: jest.fn(), status: jest.fn() }

    logError = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      agencyId: 'MDI',
      bookingId,
      firstName: 'John',
      lastName: 'Smith',
      assignedLivingUnit: { description: '1-2-003' },
    })
    incentivesApi.getIepSummaryForBooking = jest.fn().mockResolvedValue(iepSummaryForBooking)
    incentivesApi.getPrisonIncentiveLevels = jest.fn().mockResolvedValue(prisonIncentiveLevels)
    incentivesApi.changeIepLevel = jest.fn()

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ prisonApi: {}; logError: any; ... Remove this comment to see the full error message
    controller = prisonerChangeIncentiveLevelDetails({ prisonApi, incentivesApi, logError })
  })

  describe('index', () => {
    describe('when there are no errors', () => {
      it('should make the correct calls for information and render the correct template', async () => {
        await controller.index(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
        expect(prisonApi.getDetails).toHaveBeenCalledWith(res.locals, offenderNo)
        expect(incentivesApi.getIepSummaryForBooking).toHaveBeenCalledWith(res.locals, bookingId)
        expect(incentivesApi.getPrisonIncentiveLevels).toHaveBeenCalledWith(res.locals, 'MDI')
        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
          agencyId: 'MDI',
          bookingId,
          breadcrumbPrisonerName: 'Smith, John',
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
              text: 'Standard (current level)',
              value: 'STD',
            },
            {
              checked: false,
              text: 'Enhanced',
              value: 'ENH',
            },
          ],
        })
      })

      it('should indicate current incentive level ', async () => {
        incentivesApi.getIepSummaryForBooking.mockResolvedValue({
          ...iepSummaryForBooking,
          iepLevel: 'Enhanced',
        })

        await controller.index(req, res)
        const context = res.render.mock.calls.at(-1)[1]
        expect(context).toHaveProperty('selectableLevels', [
          {
            checked: false,
            text: 'Basic',
            value: 'BAS',
          },
          {
            checked: false,
            text: 'Standard',
            value: 'STD',
          },
          {
            checked: false,
            text: 'Enhanced (current level)',
            value: 'ENH',
          },
        ])
      })
    })

    describe('when there are API errors', () => {
      const error = new Error('Network error')
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
        prisonApi.getDetails.mockImplementation(() => Promise.reject(error))
      })

      it('should render the error template', async () => {
        await expect(controller.index(req, res)).rejects.toThrowError(error)
        expect(res.locals.redirectUrl).toBe(`/prisoner/${offenderNo}`)
      })
    })
  })

  describe('post', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        config.apis.incentives.ui_url = 'http://incentives-url'
        jest.spyOn(Date, 'now').mockImplementation(() => 1664192096000) // 2022-09-26T12:34:56.000+01:00
        incentivesApi.changeIepLevel.mockResolvedValue({} as unknown as IepLevelChanged) // response is ignored
      })

      it('should submit the appointment with the correct details and show confirmation', async () => {
        incentivesApi.getIepSummaryForBooking.mockResolvedValue({
          ...iepSummaryForBooking,
          iepDate: '2022-09-26',
          iepTime: '2022-09-26T12:34:56',
          iepLevel: 'Enhanced',
          daysSinceReview: 0,
          nextReviewDate: '2023-09-26',
        })

        req.body = {
          agencyId: 'MDI',
          bookingId,
          iepLevel: 'Standard',
          newIepLevel: 'Enhanced',
          reason: 'A reason why it has changed',
        }

        await controller.post(req, res)

        expect(incentivesApi.changeIepLevel).toHaveBeenCalledWith(res.locals, bookingId, {
          iepLevel: 'Enhanced',
          comment: 'A reason why it has changed',
        })
        expect(raiseAnalyticsEvent).toBeCalledWith(
          'Update Incentive level',
          'Level changed from Standard to Enhanced at MDI',
          'Incentive level change'
        )
        expect(res.render).toHaveBeenCalledWith(
          'prisonerProfile/prisonerChangeIncentiveLevelConfirmation.njk',
          expect.objectContaining({
            agencyId: 'MDI',
            bookingId,
            breadcrumbPrisonerName: 'Smith, John',
            iepSummary: expect.objectContaining({
              iepLevel: 'Enhanced',
            }),
            nextReviewDate: '26 September 2023',
            offenderNo: 'ABC123',
            prisonerName: 'John Smith',
            profileUrl: '/prisoner/ABC123',
            manageIncentivesUrl: 'http://incentives-url/incentive-summary/MDI-1',
          })
        )
      })

      it.each([undefined, 'MDI'])(
        'should use a simpler link to incentives on confirmation when the location is not known',
        async (locationId) => {
          // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
          prisonApi.getDetails = jest.fn().mockResolvedValue({
            agencyId: 'MDI',
            bookingId,
            firstName: 'John',
            lastName: 'Smith',
            assignedLivingUnit: { description: locationId },
          })

          req.body = {
            agencyId: 'MDI',
            bookingId,
            iepLevel: 'Standard',
            newIepLevel: 'Enhanced',
            reason: 'A reason why it has changed',
          }

          await controller.post(req, res)

          expect(res.render).toHaveBeenCalledWith(
            'prisonerProfile/prisonerChangeIncentiveLevelConfirmation.njk',
            expect.objectContaining({
              manageIncentivesUrl: 'http://incentives-url',
            })
          )
        }
      )
    })

    describe('when there are form errors', () => {
      it('should re render the template and return the errors', async () => {
        req.body = {}

        await controller.post(req, res)

        expect(incentivesApi.changeIepLevel).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('prisonerProfile/prisonerChangeIncentiveLevelDetails.njk', {
          agencyId: 'MDI',
          bookingId,
          breadcrumbPrisonerName: 'Smith, John',
          errors: [
            {
              href: '#newIepLevel',
              text: 'Select an incentive level, even if it is the same as before',
            },
            {
              href: '#reason',
              text: 'Enter a reason for recording',
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
              text: 'Standard (current level)',
              value: 'STD',
            },
            {
              checked: false,
              text: 'Enhanced',
              value: 'ENH',
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
                text: 'Select an incentive level, even if it is the same as before',
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
        const error = new Error('Network error')

        incentivesApi.changeIepLevel.mockRejectedValue(error)

        await expect(controller.post(req, res)).rejects.toThrowError(error)
      })
    })
  })
})
